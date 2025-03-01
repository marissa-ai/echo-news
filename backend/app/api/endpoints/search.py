from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

from app.db.session import get_db

router = APIRouter()

class SearchResponse(BaseModel):
    total: int
    page: int
    limit: int
    results: List[dict]

@router.get("", response_model=SearchResponse)
async def search(
    q: str,
    type: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """
    Search for articles, users, or comments
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Validate search type
        valid_types = ["articles", "users", "comments", "all"]
        if type and type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid search type. Must be one of: {', '.join(valid_types)}"
            )
        
        search_type = type if type else "all"
        search_term = f"%{q}%"
        
        results = []
        total = 0
        
        # Search articles
        if search_type in ["articles", "all"]:
            article_query = """
            SELECT 
                'article' as result_type,
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
                a.status = 'approved' AND
                (
                    a.title ILIKE %s OR
                    a.description ILIKE %s
                )
            """
            
            article_count_query = """
            SELECT COUNT(*) as count
            FROM 
                articles a
            JOIN 
                categories c ON a.category_id = c.category_id
            WHERE 
                a.status = 'approved' AND
                (
                    a.title ILIKE %s OR
                    a.description ILIKE %s
                )
            """
            
            params = [search_term, search_term]
            count_params = [search_term, search_term]
            
            # Add category filter
            if category:
                article_query += " AND c.name = %s"
                article_count_query += " AND c.name = %s"
                params.append(category)
                count_params.append(category)
            
            # Add tag filter
            if tag:
                article_query += """
                AND a.article_id IN (
                    SELECT at.article_id
                    FROM article_tags at
                    JOIN tags t ON at.tag_id = t.tag_id
                    WHERE t.name = %s
                )
                """
                article_count_query += """
                AND a.article_id IN (
                    SELECT at.article_id
                    FROM article_tags at
                    JOIN tags t ON at.tag_id = t.tag_id
                    WHERE t.name = %s
                )
                """
                params.append(tag)
                count_params.append(tag)
            
            # Get article count
            cursor.execute(article_count_query, count_params)
            article_count = cursor.fetchone()["count"]
            total += article_count
            
            # Only fetch articles if we're on the right page
            if search_type == "articles" or search_type == "all":
                # Add sorting and pagination
                article_query += " ORDER BY a.created_at DESC"
                
                if search_type == "articles":
                    article_query += " LIMIT %s OFFSET %s"
                    params.extend([limit, (page - 1) * limit])
                elif search_type == "all":
                    # For "all" type, we need to limit results per type
                    article_query += " LIMIT %s"
                    params.append(min(limit, 5))  # Show at most 5 articles in mixed results
                
                cursor.execute(article_query, params)
                
                for article in cursor.fetchall():
                    # Get tags for article
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
                    
                    results.append(article_data)
        
        # Search users
        if search_type in ["users", "all"]:
            user_query = """
            SELECT 
                'user' as result_type,
                u.user_id, u.username, u.display_name, u.bio, u.avatar_url, 
                u.role, u.reputation, u.created_at
            FROM 
                users u
            WHERE 
                u.username ILIKE %s OR
                u.display_name ILIKE %s OR
                u.bio ILIKE %s
            """
            
            user_count_query = """
            SELECT COUNT(*) as count
            FROM users u
            WHERE 
                u.username ILIKE %s OR
                u.display_name ILIKE %s OR
                u.bio ILIKE %s
            """
            
            user_params = [search_term, search_term, search_term]
            
            # Get user count
            cursor.execute(user_count_query, user_params)
            user_count = cursor.fetchone()["count"]
            total += user_count
            
            # Only fetch users if we're on the right page
            if search_type == "users" or search_type == "all":
                # Add sorting and pagination
                user_query += " ORDER BY u.reputation DESC"
                
                if search_type == "users":
                    user_query += " LIMIT %s OFFSET %s"
                    user_params.extend([limit, (page - 1) * limit])
                elif search_type == "all":
                    # For "all" type, we need to limit results per type
                    user_query += " LIMIT %s"
                    user_params.append(min(limit, 3))  # Show at most 3 users in mixed results
                
                cursor.execute(user_query, user_params)
                
                for user in cursor.fetchall():
                    # Get badge count
                    cursor.execute(
                        """
                        SELECT COUNT(*) as badge_count
                        FROM user_badges
                        WHERE user_id = %s
                        """,
                        (user["user_id"],)
                    )
                    badge_count = cursor.fetchone()["badge_count"]
                    
                    user_data = dict(user)
                    user_data["badge_count"] = badge_count
                    user_data["created_at"] = user["created_at"].isoformat()
                    
                    results.append(user_data)
        
        # Search comments
        if search_type in ["comments", "all"]:
            comment_query = """
            SELECT 
                'comment' as result_type,
                c.comment_id, c.article_id, c.user_id, c.text, c.created_at, c.parent_comment_id,
                u.username,
                a.title as article_title
            FROM 
                comments c
            JOIN 
                users u ON c.user_id = u.user_id
            JOIN 
                articles a ON c.article_id = a.article_id
            WHERE 
                c.is_deleted = FALSE AND
                a.status = 'approved' AND
                c.text ILIKE %s
            """
            
            comment_count_query = """
            SELECT COUNT(*) as count
            FROM 
                comments c
            JOIN 
                articles a ON c.article_id = a.article_id
            WHERE 
                c.is_deleted = FALSE AND
                a.status = 'approved' AND
                c.text ILIKE %s
            """
            
            comment_params = [search_term]
            
            # Add category filter
            if category:
                comment_query += """
                AND a.category_id IN (
                    SELECT category_id FROM categories WHERE name = %s
                )
                """
                comment_count_query += """
                AND a.category_id IN (
                    SELECT category_id FROM categories WHERE name = %s
                )
                """
                comment_params.append(category)
            
            # Get comment count
            cursor.execute(comment_count_query, comment_params)
            comment_count = cursor.fetchone()["count"]
            total += comment_count
            
            # Only fetch comments if we're on the right page
            if search_type == "comments" or search_type == "all":
                # Add sorting and pagination
                comment_query += " ORDER BY c.created_at DESC"
                
                if search_type == "comments":
                    comment_query += " LIMIT %s OFFSET %s"
                    comment_params.extend([limit, (page - 1) * limit])
                elif search_type == "all":
                    # For "all" type, we need to limit results per type
                    comment_query += " LIMIT %s"
                    comment_params.append(min(limit, 3))  # Show at most 3 comments in mixed results
                
                cursor.execute(comment_query, comment_params)
                
                for comment in cursor.fetchall():
                    comment_data = dict(comment)
                    comment_data["created_at"] = comment["created_at"].isoformat()
                    
                    results.append(comment_data)
        
        # For "all" type, sort results by relevance (simple implementation)
        if search_type == "all":
            # Sort by exact match in title/username first, then by date
            results.sort(key=lambda x: (
                # Exact title/username match gets highest priority
                -1 if (x.get("title") and x.get("title").lower() == q.lower()) or 
                      (x.get("username") and x.get("username").lower() == q.lower()) else 0,
                # Then sort by date (most recent first)
                x.get("created_at", ""), 
            ))
            
            # Apply pagination after combining and sorting
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            results = results[start_idx:end_idx]
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "results": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/suggestions", response_model=List[str])
async def get_search_suggestions(
    q: str,
    db = Depends(get_db)
):
    """
    Get search suggestions based on partial input
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        search_term = f"%{q}%"
        suggestions = set()
        
        # Get article title suggestions
        cursor.execute(
            """
            SELECT title
            FROM articles
            WHERE status = 'approved' AND title ILIKE %s
            LIMIT 5
            """,
            (search_term,)
        )
        for row in cursor.fetchall():
            suggestions.add(row["title"])
        
        # Get tag suggestions
        cursor.execute(
            """
            SELECT name
            FROM tags
            WHERE name ILIKE %s
            LIMIT 5
            """,
            (search_term,)
        )
        for row in cursor.fetchall():
            suggestions.add(row["name"])
        
        # Get category suggestions
        cursor.execute(
            """
            SELECT name
            FROM categories
            WHERE name ILIKE %s
            LIMIT 5
            """,
            (search_term,)
        )
        for row in cursor.fetchall():
            suggestions.add(row["name"])
        
        # Get username suggestions
        cursor.execute(
            """
            SELECT username
            FROM users
            WHERE username ILIKE %s
            LIMIT 5
            """,
            (search_term,)
        )
        for row in cursor.fetchall():
            suggestions.add(row["username"])
        
        # Convert to list and sort
        suggestion_list = list(suggestions)
        suggestion_list.sort(key=lambda x: (
            # Exact match gets highest priority
            0 if x.lower() == q.lower() else 1,
            # Starts with query gets second priority
            0 if x.lower().startswith(q.lower()) else 1,
            # Then sort alphabetically
            x.lower()
        ))
        
        # Limit to 10 suggestions
        return suggestion_list[:10]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get search suggestions: {str(e)}"
        )
    finally:
        cursor.close() 