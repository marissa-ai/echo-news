from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.security import get_current_user
from app.db.session import get_db

router = APIRouter()

class VoteCreate(BaseModel):
    vote_type: str  # 'upvote', 'downvote', or 'none' to remove vote

class VoteResponse(BaseModel):
    article_id: int
    upvotes: int
    downvotes: int
    score: int
    user_vote: str

class UserVoteResponse(BaseModel):
    article_id: int
    user_vote: Optional[str] = None

@router.post("/{article_id}/vote", response_model=VoteResponse)
async def vote_on_article(
    article_id: int,
    vote: VoteCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Vote on an article. 
    
    - `upvote`: Add an upvote
    - `downvote`: Add a downvote
    - `none`: Remove existing vote
    """
    # Validate vote type
    if vote.vote_type not in ["upvote", "downvote", "none"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vote type. Must be 'upvote', 'downvote', or 'none'."
        )
    
    try:
        # Check if article exists
        cursor = db.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT article_id, status, upvotes, downvotes FROM articles WHERE article_id = %s",
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        if article["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot vote on an article that is not approved"
            )
        
        # Check if user has already voted
        cursor.execute(
            "SELECT vote_id, vote_type FROM votes WHERE article_id = %s AND user_id = %s",
            (article_id, current_user["user_id"])
        )
        existing_vote = cursor.fetchone()
        
        # Handle vote based on existing vote and new vote type
        if existing_vote:
            if vote.vote_type == "none":
                # Remove vote
                cursor.execute(
                    "DELETE FROM votes WHERE vote_id = %s",
                    (existing_vote["vote_id"],)
                )
            elif vote.vote_type != existing_vote["vote_type"]:
                # Update vote
                cursor.execute(
                    "UPDATE votes SET vote_type = %s, updated_at = %s WHERE vote_id = %s",
                    (vote.vote_type, datetime.now(), existing_vote["vote_id"])
                )
            # If vote type is the same, do nothing
        elif vote.vote_type != "none":
            # Create new vote
            cursor.execute(
                "INSERT INTO votes (article_id, user_id, vote_type) VALUES (%s, %s, %s)",
                (article_id, current_user["user_id"], vote.vote_type)
            )
        
        # Get updated vote counts
        cursor.execute(
            "SELECT upvotes, downvotes FROM articles WHERE article_id = %s",
            (article_id,)
        )
        updated_article = cursor.fetchone()
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], f"article_{vote.vote_type}", article_id)
        )
        
        # Create notification for article author if it's an upvote
        if vote.vote_type == "upvote" and (not existing_vote or existing_vote["vote_type"] != "upvote"):
            cursor.execute(
                "SELECT submitted_by FROM articles WHERE article_id = %s",
                (article_id,)
            )
            article_author = cursor.fetchone()
            
            if article_author and article_author["submitted_by"] != current_user["user_id"]:
                cursor.execute(
                    """
                    INSERT INTO notifications (user_id, type, entity_id, message)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        article_author["submitted_by"],
                        "vote",
                        article_id,
                        f"Your article received an upvote from {current_user['username']}"
                    )
                )
        
        db.commit()
        
        # Calculate score
        score = updated_article["upvotes"] - updated_article["downvotes"]
        
        return {
            "article_id": article_id,
            "upvotes": updated_article["upvotes"],
            "downvotes": updated_article["downvotes"],
            "score": score,
            "user_vote": vote.vote_type if vote.vote_type != "none" else None
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process vote: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/{article_id}/vote", response_model=UserVoteResponse)
async def get_user_vote(
    article_id: int,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get the current user's vote on an article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if article exists
        cursor.execute(
            "SELECT article_id FROM articles WHERE article_id = %s",
            (article_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        # Get user's vote
        cursor.execute(
            "SELECT vote_type FROM votes WHERE article_id = %s AND user_id = %s",
            (article_id, current_user["user_id"])
        )
        vote = cursor.fetchone()
        
        return {
            "article_id": article_id,
            "user_vote": vote["vote_type"] if vote else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user vote: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/{article_id}/votes", response_model=VoteResponse)
async def get_article_votes(
    article_id: int,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get vote counts for an article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get article and vote counts
        cursor.execute(
            "SELECT article_id, upvotes, downvotes FROM articles WHERE article_id = %s",
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        # Get user's vote
        cursor.execute(
            "SELECT vote_type FROM votes WHERE article_id = %s AND user_id = %s",
            (article_id, current_user["user_id"])
        )
        user_vote = cursor.fetchone()
        
        # Calculate score
        score = article["upvotes"] - article["downvotes"]
        
        return {
            "article_id": article_id,
            "upvotes": article["upvotes"],
            "downvotes": article["downvotes"],
            "score": score,
            "user_vote": user_vote["vote_type"] if user_vote else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get article votes: {str(e)}"
        )
    finally:
        cursor.close() 