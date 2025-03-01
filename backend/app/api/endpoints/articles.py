from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.security import get_current_user
from app.db.session import get_db

router = APIRouter()

class ArticleCreate(BaseModel):
    title: str
    description: str
    url: Optional[HttpUrl] = None
    category: str
    tags: List[str] = []

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class ArticleResponse(BaseModel):
    article_id: int
    title: str
    description: str
    url: Optional[str] = None
    category: str
    tags: List[str]
    submitted_by: str
    created_at: str
    status: str

class ArticleListResponse(BaseModel):
    total: int
    page: int
    limit: int
    articles: List[dict]

class ArticleDetailResponse(BaseModel):
    article_id: int
    title: str
    description: str
    url: Optional[str] = None
    category: str
    tags: List[str]
    submitted_by: str
    created_at: str
    upvotes: int
    downvotes: int
    score: int
    comments: List[dict] = []

class DeleteResponse(BaseModel):
    message: str

@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article: ArticleCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Submit a new article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get category_id or create if it doesn't exist
        cursor.execute(
            "SELECT category_id FROM categories WHERE name = %s",
            (article.category,)
        )
        category_result = cursor.fetchone()
        
        if category_result:
            category_id = category_result["category_id"]
        else:
            cursor.execute(
                """
                INSERT INTO categories (name, created_by)
                VALUES (%s, %s)
                RETURNING category_id
                """,
                (article.category, current_user["user_id"])
            )
            category_id = cursor.fetchone()["category_id"]
        
        # Insert article
        cursor.execute(
            """
            INSERT INTO articles (
                title, description, source_url, category_id, submitted_by, status
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING article_id, title, description, source_url, created_at, status
            """,
            (
                article.title,
                article.description,
                article.url,
                category_id,
                current_user["user_id"],
                'pending'  # All articles start as pending for moderation
            )
        )
        new_article = cursor.fetchone()
        
        # Process tags
        for tag_name in article.tags:
            # Check if tag exists
            cursor.execute(
                "SELECT tag_id FROM tags WHERE name = %s",
                (tag_name,)
            )
            tag_result = cursor.fetchone()
            
            if tag_result:
                tag_id = tag_result["tag_id"]
            else:
                # Create new tag
                cursor.execute(
                    """
                    INSERT INTO tags (name, created_by)
                    VALUES (%s, %s)
                    RETURNING tag_id
                    """,
                    (tag_name, current_user["user_id"])
                )
                tag_id = cursor.fetchone()["tag_id"]
            
            # Associate tag with article
            cursor.execute(
                """
                INSERT INTO article_tags (article_id, tag_id)
                VALUES (%s, %s)
                """,
                (new_article["article_id"], tag_id)
            )
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "article_submit", new_article["article_id"])
        )
        
        # Check if user has "First Article" badge
        cursor.execute(
            """
            SELECT COUNT(*) as article_count
            FROM articles
            WHERE submitted_by = %s
            """,
            (current_user["user_id"],)
        )
        article_count = cursor.fetchone()["article_count"]
        
        if article_count == 1:
            # Award "First Article" badge
            cursor.execute(
                """
                INSERT INTO user_badges (user_id, badge_id)
                SELECT %s, badge_id FROM badges WHERE name = 'First Article'
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
        
        # Get tags for response
        cursor.execute(
            """
            SELECT t.name
            FROM tags t
            JOIN article_tags at ON t.tag_id = at.tag_id
            WHERE at.article_id = %s
            """,
            (new_article["article_id"],)
        )
        tags = [row["name"] for row in cursor.fetchall()]
        
        return {
            "article_id": new_article["article_id"],
            "title": new_article["title"],
            "description": new_article["description"],
            "url": new_article["source_url"],
            "category": article.category,
            "tags": tags,
            "submitted_by": username,
            "created_at": new_article["created_at"].isoformat(),
            "status": new_article["status"]
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create article: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("", response_model=ArticleListResponse)
async def get_articles(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    timeframe: Optional[str] = None,
    sort: str = "trending",
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """
    Get a list of articles with optional filtering and sorting
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Base query
        query = """
        SELECT 
            a.article_id, a.title, a.description, a.source_url, a.created_at, 
            a.upvotes, a.downvotes, a.views, a.is_featured,
            c.name as category,
            u.username as submitted_by
        FROM 
            articles a
        JOIN 
            categories c ON a.category_id = c.category_id
        JOIN 
            users u ON a.submitted_by = u.user_id
        WHERE 
            a.status = 'approved'
        """
        count_query = """
        SELECT COUNT(*) as total
        FROM articles a
        JOIN categories c ON a.category_id = c.category_id
        WHERE a.status = 'approved'
        """
        
        params = []
        count_params = []
        
        # Add filters
        if category:
            query += " AND c.name = %s"
            count_query += " AND c.name = %s"
            params.append(category)
            count_params.append(category)
        
        if tag:
            query += """
            AND a.article_id IN (
                SELECT at.article_id
                FROM article_tags at
                JOIN tags t ON at.tag_id = t.tag_id
                WHERE t.name = %s
            )
            """
            count_query += """
            AND a.article_id IN (
                SELECT at.article_id
                FROM article_tags at
                JOIN tags t ON at.tag_id = t.tag_id
                WHERE t.name = %s
            )
            """
            params.append(tag)
            count_params.append(tag)
        
        if timeframe:
            time_filter = None
            if timeframe == "day":
                time_filter = "1 day"
            elif timeframe == "week":
                time_filter = "1 week"
            elif timeframe == "month":
                time_filter = "1 month"
            
            if time_filter:
                query += " AND a.created_at > NOW() - INTERVAL %s"
                count_query += " AND a.created_at > NOW() - INTERVAL %s"
                params.append(time_filter)
                count_params.append(time_filter)
        
        # Add sorting
        if sort == "trending":
            query += """
            ORDER BY 
                CASE WHEN a.is_featured THEN 1 ELSE 0 END DESC,
                (a.upvotes - a.downvotes) / GREATEST(1, EXTRACT(EPOCH FROM (NOW() - a.created_at))/3600) DESC
            """
        elif sort == "newest":
            query += " ORDER BY a.created_at DESC"
        elif sort == "most_voted":
            query += " ORDER BY (a.upvotes - a.downvotes) DESC"
        else:
            query += " ORDER BY a.created_at DESC"  # Default sort
        
        # Add pagination
        query += " LIMIT %s OFFSET %s"
        params.extend([limit, (page - 1) * limit])
        
        # Execute count query
        cursor.execute(count_query, count_params)
        total = cursor.fetchone()["total"]
        
        # Execute main query
        cursor.execute(query, params)
        articles = cursor.fetchall()
        
        # Get tags for each article
        result_articles = []
        for article in articles:
            cursor.execute(
                """
                SELECT t.name
                FROM tags t
                JOIN article_tags at ON t.tag_id = at.tag_id
                WHERE at.article_id = %s
                """,
                (article["article_id"],)
            )
            tags = [row["name"] for row in cursor.fetchall()]
            
            # Calculate score
            score = article["upvotes"] - article["downvotes"]
            
            article_data = dict(article)
            article_data["tags"] = tags
            article_data["score"] = score
            article_data["created_at"] = article["created_at"].isoformat()
            
            result_articles.append(article_data)
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "articles": result_articles
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get articles: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/{article_id}", response_model=ArticleDetailResponse)
async def get_article(
    article_id: int,
    db = Depends(get_db)
):
    """
    Get a single article by ID
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get article
        cursor.execute(
            """
            SELECT 
                a.article_id, a.title, a.description, a.source_url, a.created_at, 
                a.upvotes, a.downvotes, a.views,
                c.name as category,
                u.username as submitted_by
            FROM 
                articles a
            JOIN 
                categories c ON a.category_id = c.category_id
            JOIN 
                users u ON a.submitted_by = u.user_id
            WHERE 
                a.article_id = %s AND a.status = 'approved'
            """,
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        # Increment view count
        cursor.execute(
            "UPDATE articles SET views = views + 1 WHERE article_id = %s",
            (article_id,)
        )
        
        # Get tags
        cursor.execute(
            """
            SELECT t.name
            FROM tags t
            JOIN article_tags at ON t.tag_id = at.tag_id
            WHERE at.article_id = %s
            """,
            (article_id,)
        )
        tags = [row["name"] for row in cursor.fetchall()]
        
        # Get comments
        cursor.execute(
            """
            SELECT 
                c.comment_id, c.text, c.created_at,
                u.user_id, u.username
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
        comments = []
        for comment in cursor.fetchall():
            comments.append({
                "comment_id": comment["comment_id"],
                "text": comment["text"],
                "user": {
                    "user_id": comment["user_id"],
                    "username": comment["username"]
                },
                "created_at": comment["created_at"].isoformat()
            })
        
        # Calculate score
        score = article["upvotes"] - article["downvotes"]
        
        db.commit()
        
        return {
            "article_id": article["article_id"],
            "title": article["title"],
            "description": article["description"],
            "url": article["source_url"],
            "category": article["category"],
            "tags": tags,
            "submitted_by": article["submitted_by"],
            "created_at": article["created_at"].isoformat(),
            "upvotes": article["upvotes"],
            "downvotes": article["downvotes"],
            "score": score,
            "comments": comments
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get article: {str(e)}"
        )
    finally:
        cursor.close()

@router.put("/{article_id}", response_model=ArticleDetailResponse)
async def update_article(
    article_id: int,
    article_update: ArticleUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update an article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if article exists and user is the owner
        cursor.execute(
            """
            SELECT a.article_id, a.submitted_by, a.status
            FROM articles a
            WHERE a.article_id = %s
            """,
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        # Check if user is the owner or an admin
        if article["submitted_by"] != current_user["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this article"
            )
        
        # Build update query
        update_fields = []
        update_values = []
        
        if article_update.title:
            update_fields.append("title = %s")
            update_values.append(article_update.title)
        
        if article_update.description:
            update_fields.append("description = %s")
            update_values.append(article_update.description)
        
        category_id = None
        if article_update.category:
            # Get category_id or create if it doesn't exist
            cursor.execute(
                "SELECT category_id FROM categories WHERE name = %s",
                (article_update.category,)
            )
            category_result = cursor.fetchone()
            
            if category_result:
                category_id = category_result["category_id"]
            else:
                cursor.execute(
                    """
                    INSERT INTO categories (name, created_by)
                    VALUES (%s, %s)
                    RETURNING category_id
                    """,
                    (article_update.category, current_user["user_id"])
                )
                category_id = cursor.fetchone()["category_id"]
            
            update_fields.append("category_id = %s")
            update_values.append(category_id)
        
        # Only update if there are fields to update
        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            # If article was approved, set back to pending for re-moderation
            if article["status"] == "approved":
                update_fields.append("status = 'pending'")
            
            query = f"""
            UPDATE articles
            SET {", ".join(update_fields)}
            WHERE article_id = %s
            """
            update_values.append(article_id)
            
            cursor.execute(query, update_values)
        
        # Update tags if provided
        if article_update.tags is not None:
            # Remove existing tags
            cursor.execute(
                "DELETE FROM article_tags WHERE article_id = %s",
                (article_id,)
            )
            
            # Add new tags
            for tag_name in article_update.tags:
                # Check if tag exists
                cursor.execute(
                    "SELECT tag_id FROM tags WHERE name = %s",
                    (tag_name,)
                )
                tag_result = cursor.fetchone()
                
                if tag_result:
                    tag_id = tag_result["tag_id"]
                else:
                    # Create new tag
                    cursor.execute(
                        """
                        INSERT INTO tags (name, created_by)
                        VALUES (%s, %s)
                        RETURNING tag_id
                        """,
                        (tag_name, current_user["user_id"])
                    )
                    tag_id = cursor.fetchone()["tag_id"]
                
                # Associate tag with article
                cursor.execute(
                    """
                    INSERT INTO article_tags (article_id, tag_id)
                    VALUES (%s, %s)
                    """,
                    (article_id, tag_id)
                )
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "article_update", article_id)
        )
        
        db.commit()
        
        # Get updated article for response
        cursor.execute(
            """
            SELECT 
                a.article_id, a.title, a.description, a.source_url, a.created_at, 
                a.upvotes, a.downvotes, a.views,
                c.name as category,
                u.username as submitted_by
            FROM 
                articles a
            JOIN 
                categories c ON a.category_id = c.category_id
            JOIN 
                users u ON a.submitted_by = u.user_id
            WHERE 
                a.article_id = %s
            """,
            (article_id,)
        )
        updated_article = cursor.fetchone()
        
        # Get tags
        cursor.execute(
            """
            SELECT t.name
            FROM tags t
            JOIN article_tags at ON t.tag_id = at.tag_id
            WHERE at.article_id = %s
            """,
            (article_id,)
        )
        tags = [row["name"] for row in cursor.fetchall()]
        
        # Get comments
        cursor.execute(
            """
            SELECT 
                c.comment_id, c.text, c.created_at,
                u.user_id, u.username
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
        comments = []
        for comment in cursor.fetchall():
            comments.append({
                "comment_id": comment["comment_id"],
                "text": comment["text"],
                "user": {
                    "user_id": comment["user_id"],
                    "username": comment["username"]
                },
                "created_at": comment["created_at"].isoformat()
            })
        
        # Calculate score
        score = updated_article["upvotes"] - updated_article["downvotes"]
        
        return {
            "article_id": updated_article["article_id"],
            "title": updated_article["title"],
            "description": updated_article["description"],
            "url": updated_article["source_url"],
            "category": updated_article["category"],
            "tags": tags,
            "submitted_by": updated_article["submitted_by"],
            "created_at": updated_article["created_at"].isoformat(),
            "upvotes": updated_article["upvotes"],
            "downvotes": updated_article["downvotes"],
            "score": score,
            "comments": comments
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update article: {str(e)}"
        )
    finally:
        cursor.close()

@router.delete("/{article_id}", response_model=DeleteResponse)
async def delete_article(
    article_id: int,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete an article
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if article exists and user is the owner
        cursor.execute(
            """
            SELECT submitted_by
            FROM articles
            WHERE article_id = %s
            """,
            (article_id,)
        )
        article = cursor.fetchone()
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        # Check if user is the owner or an admin
        if article["submitted_by"] != current_user["user_id"] and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this article"
            )
        
        # Delete article
        cursor.execute(
            "DELETE FROM articles WHERE article_id = %s",
            (article_id,)
        )
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type, entity_id)
            VALUES (%s, %s, %s)
            """,
            (current_user["user_id"], "article_delete", article_id)
        )
        
        db.commit()
        
        return {"message": "Article deleted successfully"}
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete article: {str(e)}"
        )
    finally:
        cursor.close() 