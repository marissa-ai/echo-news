from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.security import get_current_user
from app.db.session import get_db

router = APIRouter()

class CommentCreate(BaseModel):
    article_id: int
    text: str
    parent_comment_id: Optional[int] = None

class CommentUpdate(BaseModel):
    text: str

class CommentResponse(BaseModel):
    comment_id: int
    article_id: int
    text: str
    user_id: int
    username: str
    created_at: str
    parent_comment_id: Optional[int] = None
    replies: Optional[List[dict]] = None

class DeleteResponse(BaseModel):
    message: str

@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment: CommentCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new comment
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if article exists
        cursor.execute(
            "SELECT article_id FROM articles WHERE article_id = %s AND status = 'approved'",
            (comment.article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found or not approved"
            )
        
        # Check if parent comment exists if provided
        if comment.parent_comment_id:
            cursor.execute(
                """
                SELECT comment_id, article_id 
                FROM comments 
                WHERE comment_id = %s AND is_deleted = FALSE
                """,
                (comment.parent_comment_id,)
            )
            parent_comment = cursor.fetchone()
            
            if not parent_comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found"
                )
            
            # Check if parent comment belongs to the same article
            if parent_comment["article_id"] != comment.article_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment does not belong to the specified article"
                )
        
        # Insert comment
        cursor.execute(
            """
            INSERT INTO comments (article_id, user_id, text, parent_comment_id)
            VALUES (%s, %s, %s, %s)
            RETURNING comment_id, article_id, user_id, text, created_at, parent_comment_id
            """,
            (
                comment.article_id,
                current_user["user_id"],
                comment.text,
                comment.parent_comment_id
            )
        )
        new_comment = cursor.fetchone()
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "comment_create", new_comment["comment_id"])
        )
        
        # Check if user has "First Comment" badge
        cursor.execute(
            """
            SELECT COUNT(*) as comment_count
            FROM comments
            WHERE user_id = %s
            """,
            (current_user["user_id"],)
        )
        comment_count = cursor.fetchone()["comment_count"]
        
        if comment_count == 1:
            # Award "First Comment" badge
            cursor.execute(
                """
                INSERT INTO user_badges (user_id, badge_id)
                SELECT %s, badge_id FROM badges WHERE name = 'First Comment'
                ON CONFLICT DO NOTHING
                """,
                (current_user["user_id"],)
            )
        
        db.commit()
        
        # Get username for response
        cursor.execute(
            "SELECT username FROM users WHERE user_id = %s",
            (current_user["user_id"],)
        )
        username = cursor.fetchone()["username"]
        
        return {
            "comment_id": new_comment["comment_id"],
            "article_id": new_comment["article_id"],
            "text": new_comment["text"],
            "user_id": new_comment["user_id"],
            "username": username,
            "created_at": new_comment["created_at"].isoformat(),
            "parent_comment_id": new_comment["parent_comment_id"],
            "replies": []
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create comment: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/article/{article_id}", response_model=List[CommentResponse])
async def get_article_comments(
    article_id: int,
    db = Depends(get_db)
):
    """
    Get all comments for an article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if article exists
        cursor.execute(
            "SELECT article_id FROM articles WHERE article_id = %s AND status = 'approved'",
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found or not approved"
            )
        
        # Get top-level comments
        cursor.execute(
            """
            SELECT 
                c.comment_id, c.article_id, c.user_id, c.text, c.created_at, c.parent_comment_id,
                u.username
            FROM 
                comments c
            JOIN 
                users u ON c.user_id = u.user_id
            WHERE 
                c.article_id = %s AND c.parent_comment_id IS NULL AND c.is_deleted = FALSE
            ORDER BY 
                c.created_at DESC
            """,
            (article_id,)
        )
        top_comments = cursor.fetchall()
        
        # Get all replies
        cursor.execute(
            """
            SELECT 
                c.comment_id, c.article_id, c.user_id, c.text, c.created_at, c.parent_comment_id,
                u.username
            FROM 
                comments c
            JOIN 
                users u ON c.user_id = u.user_id
            WHERE 
                c.article_id = %s AND c.parent_comment_id IS NOT NULL AND c.is_deleted = FALSE
            ORDER BY 
                c.created_at ASC
            """,
            (article_id,)
        )
        all_replies = cursor.fetchall()
        
        # Organize replies by parent_comment_id
        replies_by_parent = {}
        for reply in all_replies:
            parent_id = reply["parent_comment_id"]
            if parent_id not in replies_by_parent:
                replies_by_parent[parent_id] = []
            
            replies_by_parent[parent_id].append({
                "comment_id": reply["comment_id"],
                "article_id": reply["article_id"],
                "text": reply["text"],
                "user_id": reply["user_id"],
                "username": reply["username"],
                "created_at": reply["created_at"].isoformat(),
                "parent_comment_id": reply["parent_comment_id"]
            })
        
        # Build response with nested replies
        result = []
        for comment in top_comments:
            comment_data = {
                "comment_id": comment["comment_id"],
                "article_id": comment["article_id"],
                "text": comment["text"],
                "user_id": comment["user_id"],
                "username": comment["username"],
                "created_at": comment["created_at"].isoformat(),
                "parent_comment_id": comment["parent_comment_id"],
                "replies": replies_by_parent.get(comment["comment_id"], [])
            }
            result.append(comment_data)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get comments: {str(e)}"
        )
    finally:
        cursor.close()

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update a comment
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if comment exists and user is the owner
        cursor.execute(
            """
            SELECT c.comment_id, c.article_id, c.user_id, c.parent_comment_id
            FROM comments c
            WHERE c.comment_id = %s AND c.is_deleted = FALSE
            """,
            (comment_id,)
        )
        comment = cursor.fetchone()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Check if user is the owner or an admin
        if comment["user_id"] != current_user["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this comment"
            )
        
        # Update comment
        cursor.execute(
            """
            UPDATE comments
            SET text = %s, updated_at = CURRENT_TIMESTAMP
            WHERE comment_id = %s
            RETURNING comment_id, article_id, user_id, text, created_at, parent_comment_id
            """,
            (comment_update.text, comment_id)
        )
        updated_comment = cursor.fetchone()
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "comment_update", comment_id)
        )
        
        db.commit()
        
        # Get username for response
        cursor.execute(
            "SELECT username FROM users WHERE user_id = %s",
            (updated_comment["user_id"],)
        )
        username = cursor.fetchone()["username"]
        
        # Get replies if this is a top-level comment
        replies = []
        if updated_comment["parent_comment_id"] is None:
            cursor.execute(
                """
                SELECT 
                    c.comment_id, c.article_id, c.user_id, c.text, c.created_at, c.parent_comment_id,
                    u.username
                FROM 
                    comments c
                JOIN 
                    users u ON c.user_id = u.user_id
                WHERE 
                    c.parent_comment_id = %s AND c.is_deleted = FALSE
                ORDER BY 
                    c.created_at ASC
                """,
                (comment_id,)
            )
            for reply in cursor.fetchall():
                replies.append({
                    "comment_id": reply["comment_id"],
                    "article_id": reply["article_id"],
                    "text": reply["text"],
                    "user_id": reply["user_id"],
                    "username": reply["username"],
                    "created_at": reply["created_at"].isoformat(),
                    "parent_comment_id": reply["parent_comment_id"]
                })
        
        return {
            "comment_id": updated_comment["comment_id"],
            "article_id": updated_comment["article_id"],
            "text": updated_comment["text"],
            "user_id": updated_comment["user_id"],
            "username": username,
            "created_at": updated_comment["created_at"].isoformat(),
            "parent_comment_id": updated_comment["parent_comment_id"],
            "replies": replies
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update comment: {str(e)}"
        )
    finally:
        cursor.close()

@router.delete("/{comment_id}", response_model=DeleteResponse)
async def delete_comment(
    comment_id: int,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete a comment (soft delete)
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if comment exists and user is the owner
        cursor.execute(
            """
            SELECT user_id
            FROM comments
            WHERE comment_id = %s AND is_deleted = FALSE
            """,
            (comment_id,)
        )
        comment = cursor.fetchone()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Check if user is the owner or an admin
        if comment["user_id"] != current_user["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this comment"
            )
        
        # Soft delete comment
        cursor.execute(
            """
            UPDATE comments
            SET is_deleted = TRUE, text = '[deleted]', updated_at = CURRENT_TIMESTAMP
            WHERE comment_id = %s
            """,
            (comment_id,)
        )
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "comment_delete", comment_id)
        )
        
        db.commit()
        
        return {"message": "Comment deleted successfully"}
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete comment: {str(e)}"
        )
    finally:
        cursor.close() 