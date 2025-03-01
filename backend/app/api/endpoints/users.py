from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.security import get_current_user, get_password_hash
from app.db.session import get_db

router = APIRouter()

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    dark_mode: Optional[bool] = None
    default_view: Optional[str] = None

class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    email: str
    role: str
    reputation: int
    created_at: str
    last_login: Optional[str] = None
    badges: List[dict] = []

class UserPreferencesResponse(BaseModel):
    email_notifications: bool
    dark_mode: bool
    default_view: str

class UserActivityResponse(BaseModel):
    total: int
    page: int
    limit: int
    activities: List[dict]

class UserArticlesResponse(BaseModel):
    total: int
    page: int
    limit: int
    articles: List[dict]

class UserCommentsResponse(BaseModel):
    total: int
    page: int
    limit: int
    comments: List[dict]

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get current user's profile
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get user profile
        cursor.execute(
            """
            SELECT 
                u.user_id, u.username, u.display_name, u.bio, u.avatar_url, 
                u.email, u.role, u.reputation, u.created_at, u.last_login
            FROM 
                users u
            WHERE 
                u.user_id = %s
            """,
            (current_user["user_id"],)
        )
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user badges
        cursor.execute(
            """
            SELECT 
                b.badge_id, b.name, b.description, b.icon, ub.awarded_at
            FROM 
                user_badges ub
            JOIN 
                badges b ON ub.badge_id = b.badge_id
            WHERE 
                ub.user_id = %s
            ORDER BY 
                ub.awarded_at DESC
            """,
            (current_user["user_id"],)
        )
        badges = []
        for badge in cursor.fetchall():
            badges.append({
                "badge_id": badge["badge_id"],
                "name": badge["name"],
                "description": badge["description"],
                "icon": badge["icon"],
                "awarded_at": badge["awarded_at"].isoformat()
            })
        
        return {
            "user_id": user["user_id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user["bio"],
            "avatar_url": user["avatar_url"],
            "email": user["email"],
            "role": user["role"],
            "reputation": user["reputation"],
            "created_at": user["created_at"].isoformat(),
            "last_login": user["last_login"].isoformat() if user["last_login"] else None,
            "badges": badges
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/{username}", response_model=UserProfileResponse)
async def get_user_profile(
    username: str,
    db = Depends(get_db)
):
    """
    Get a user's public profile by username
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get user profile
        cursor.execute(
            """
            SELECT 
                u.user_id, u.username, u.display_name, u.bio, u.avatar_url, 
                u.email, u.role, u.reputation, u.created_at, u.last_login
            FROM 
                users u
            WHERE 
                u.username = %s
            """,
            (username,)
        )
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user badges
        cursor.execute(
            """
            SELECT 
                b.badge_id, b.name, b.description, b.icon, ub.awarded_at
            FROM 
                user_badges ub
            JOIN 
                badges b ON ub.badge_id = b.badge_id
            WHERE 
                ub.user_id = %s
            ORDER BY 
                ub.awarded_at DESC
            """,
            (user["user_id"],)
        )
        badges = []
        for badge in cursor.fetchall():
            badges.append({
                "badge_id": badge["badge_id"],
                "name": badge["name"],
                "description": badge["description"],
                "icon": badge["icon"],
                "awarded_at": badge["awarded_at"].isoformat()
            })
        
        # Hide email for privacy unless it's the current user
        email = "***@***.***"
        
        return {
            "user_id": user["user_id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user["bio"],
            "avatar_url": user["avatar_url"],
            "email": email,
            "role": user["role"],
            "reputation": user["reputation"],
            "created_at": user["created_at"].isoformat(),
            "last_login": user["last_login"].isoformat() if user["last_login"] else None,
            "badges": badges
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )
    finally:
        cursor.close()

@router.put("/me", response_model=UserProfileResponse)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update current user's profile
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Build update query
        update_fields = []
        update_values = []
        
        if profile_update.display_name is not None:
            update_fields.append("display_name = %s")
            update_values.append(profile_update.display_name)
        
        if profile_update.bio is not None:
            update_fields.append("bio = %s")
            update_values.append(profile_update.bio)
        
        if profile_update.avatar_url is not None:
            update_fields.append("avatar_url = %s")
            update_values.append(profile_update.avatar_url)
        
        if profile_update.email is not None:
            # Check if email is already in use
            cursor.execute(
                "SELECT user_id FROM users WHERE email = %s AND user_id != %s",
                (profile_update.email, current_user["user_id"])
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            
            update_fields.append("email = %s")
            update_values.append(profile_update.email)
        
        if profile_update.password is not None:
            # Hash the new password
            hashed_password = get_password_hash(profile_update.password)
            update_fields.append("password = %s")
            update_values.append(hashed_password)
        
        # Only update if there are fields to update
        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            query = f"""
            UPDATE users
            SET {", ".join(update_fields)}
            WHERE user_id = %s
            RETURNING user_id, username, display_name, bio, avatar_url, email, role, reputation, created_at, last_login
            """
            update_values.append(current_user["user_id"])
            
            cursor.execute(query, update_values)
            updated_user = cursor.fetchone()
            
            # Log user activity
            cursor.execute(
                """
                INSERT INTO user_activity (user_id, activity_type, entity_id)
                VALUES (%s, %s, %s)
                """,
                (current_user["user_id"], "profile_update", current_user["user_id"])
            )
            
            db.commit()
            
            # Get user badges
            cursor.execute(
                """
                SELECT 
                    b.badge_id, b.name, b.description, b.icon, ub.awarded_at
                FROM 
                    user_badges ub
                JOIN 
                    badges b ON ub.badge_id = b.badge_id
                WHERE 
                    ub.user_id = %s
                ORDER BY 
                    ub.awarded_at DESC
                """,
                (current_user["user_id"],)
            )
            badges = []
            for badge in cursor.fetchall():
                badges.append({
                    "badge_id": badge["badge_id"],
                    "name": badge["name"],
                    "description": badge["description"],
                    "icon": badge["icon"],
                    "awarded_at": badge["awarded_at"].isoformat()
                })
            
            return {
                "user_id": updated_user["user_id"],
                "username": updated_user["username"],
                "display_name": updated_user["display_name"],
                "bio": updated_user["bio"],
                "avatar_url": updated_user["avatar_url"],
                "email": updated_user["email"],
                "role": updated_user["role"],
                "reputation": updated_user["reputation"],
                "created_at": updated_user["created_at"].isoformat(),
                "last_login": updated_user["last_login"].isoformat() if updated_user["last_login"] else None,
                "badges": badges
            }
        else:
            # No fields to update, return current user profile
            return await get_current_user_profile(current_user, db)
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_current_user_preferences(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get current user's preferences
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get user preferences
        cursor.execute(
            """
            SELECT 
                email_notifications, dark_mode, default_view
            FROM 
                user_preferences
            WHERE 
                user_id = %s
            """,
            (current_user["user_id"],)
        )
        preferences = cursor.fetchone()
        
        if not preferences:
            # Create default preferences if not found
            cursor.execute(
                """
                INSERT INTO user_preferences (user_id, email_notifications, dark_mode, default_view)
                VALUES (%s, TRUE, FALSE, 'trending')
                RETURNING email_notifications, dark_mode, default_view
                """,
                (current_user["user_id"],)
            )
            preferences = cursor.fetchone()
            db.commit()
        
        return {
            "email_notifications": preferences["email_notifications"],
            "dark_mode": preferences["dark_mode"],
            "default_view": preferences["default_view"]
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user preferences: {str(e)}"
        )
    finally:
        cursor.close()

@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_current_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update current user's preferences
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Build update query
        update_fields = []
        update_values = []
        
        if preferences_update.email_notifications is not None:
            update_fields.append("email_notifications = %s")
            update_values.append(preferences_update.email_notifications)
        
        if preferences_update.dark_mode is not None:
            update_fields.append("dark_mode = %s")
            update_values.append(preferences_update.dark_mode)
        
        if preferences_update.default_view is not None:
            # Validate default_view
            valid_views = ["trending", "newest", "most_voted"]
            if preferences_update.default_view not in valid_views:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid default_view. Must be one of: {', '.join(valid_views)}"
                )
            
            update_fields.append("default_view = %s")
            update_values.append(preferences_update.default_view)
        
        # Only update if there are fields to update
        if update_fields:
            # Check if preferences exist
            cursor.execute(
                "SELECT 1 FROM user_preferences WHERE user_id = %s",
                (current_user["user_id"],)
            )
            preferences_exist = cursor.fetchone() is not None
            
            if preferences_exist:
                # Update existing preferences
                query = f"""
                UPDATE user_preferences
                SET {", ".join(update_fields)}
                WHERE user_id = %s
                RETURNING email_notifications, dark_mode, default_view
                """
                update_values.append(current_user["user_id"])
                
                cursor.execute(query, update_values)
                updated_preferences = cursor.fetchone()
            else:
                # Create default preferences with updates
                email_notifications = preferences_update.email_notifications if preferences_update.email_notifications is not None else True
                dark_mode = preferences_update.dark_mode if preferences_update.dark_mode is not None else False
                default_view = preferences_update.default_view if preferences_update.default_view is not None else "trending"
                
                cursor.execute(
                    """
                    INSERT INTO user_preferences (user_id, email_notifications, dark_mode, default_view)
                    VALUES (%s, %s, %s, %s)
                    RETURNING email_notifications, dark_mode, default_view
                    """,
                    (current_user["user_id"], email_notifications, dark_mode, default_view)
                )
                updated_preferences = cursor.fetchone()
            
            # Log user activity
            cursor.execute(
                """
                INSERT INTO user_activity (user_id, activity_type, entity_id)
                VALUES (%s, %s, %s)
                """,
                (current_user["user_id"], "preferences_update", current_user["user_id"])
            )
            
            db.commit()
            
            return {
                "email_notifications": updated_preferences["email_notifications"],
                "dark_mode": updated_preferences["dark_mode"],
                "default_view": updated_preferences["default_view"]
            }
        else:
            # No fields to update, return current preferences
            return await get_current_user_preferences(current_user, db)
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user preferences: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/me/activity", response_model=UserActivityResponse)
async def get_current_user_activity(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get current user's activity history
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get total count
        cursor.execute(
            """
            SELECT COUNT(*) as total
            FROM user_activity
            WHERE user_id = %s
            """,
            (current_user["user_id"],)
        )
        total = cursor.fetchone()["total"]
        
        # Get paginated activity
        cursor.execute(
            """
            SELECT 
                activity_id, activity_type, entity_id, created_at
            FROM 
                user_activity
            WHERE 
                user_id = %s
            ORDER BY 
                created_at DESC
            LIMIT %s OFFSET %s
            """,
            (current_user["user_id"], limit, (page - 1) * limit)
        )
        activities = []
        
        for activity in cursor.fetchall():
            activity_data = {
                "activity_id": activity["activity_id"],
                "activity_type": activity["activity_type"],
                "entity_id": activity["entity_id"],
                "created_at": activity["created_at"].isoformat()
            }
            
            # Get additional details based on activity type
            if activity["activity_type"] in ["article_submit", "article_update", "article_delete"]:
                cursor.execute(
                    """
                    SELECT title FROM articles WHERE article_id = %s
                    """,
                    (activity["entity_id"],)
                )
                article = cursor.fetchone()
                if article:
                    activity_data["entity_title"] = article["title"]
            
            elif activity["activity_type"] in ["comment_create", "comment_update", "comment_delete"]:
                cursor.execute(
                    """
                    SELECT c.text, a.article_id, a.title
                    FROM comments c
                    JOIN articles a ON c.article_id = a.article_id
                    WHERE c.comment_id = %s
                    """,
                    (activity["entity_id"],)
                )
                comment = cursor.fetchone()
                if comment:
                    activity_data["entity_text"] = comment["text"]
                    activity_data["article_id"] = comment["article_id"]
                    activity_data["article_title"] = comment["title"]
            
            elif activity["activity_type"] in ["vote_up", "vote_down"]:
                cursor.execute(
                    """
                    SELECT a.article_id, a.title
                    FROM votes v
                    JOIN articles a ON v.article_id = a.article_id
                    WHERE v.vote_id = %s
                    """,
                    (activity["entity_id"],)
                )
                vote = cursor.fetchone()
                if vote:
                    activity_data["article_id"] = vote["article_id"]
                    activity_data["article_title"] = vote["title"]
            
            activities.append(activity_data)
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "activities": activities
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user activity: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/me/articles", response_model=UserArticlesResponse)
async def get_current_user_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get articles submitted by the current user
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get total count
        cursor.execute(
            """
            SELECT COUNT(*) as total
            FROM articles
            WHERE submitted_by = %s
            """,
            (current_user["user_id"],)
        )
        total = cursor.fetchone()["total"]
        
        # Get paginated articles
        cursor.execute(
            """
            SELECT 
                a.article_id, a.title, a.description, a.source_url, a.created_at, 
                a.upvotes, a.downvotes, a.views, a.status,
                c.name as category
            FROM 
                articles a
            JOIN 
                categories c ON a.category_id = c.category_id
            WHERE 
                a.submitted_by = %s
            ORDER BY 
                a.created_at DESC
            LIMIT %s OFFSET %s
            """,
            (current_user["user_id"], limit, (page - 1) * limit)
        )
        articles = []
        
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
            
            articles.append({
                "article_id": article["article_id"],
                "title": article["title"],
                "description": article["description"],
                "url": article["source_url"],
                "category": article["category"],
                "tags": tags,
                "created_at": article["created_at"].isoformat(),
                "upvotes": article["upvotes"],
                "downvotes": article["downvotes"],
                "views": article["views"],
                "score": score,
                "status": article["status"]
            })
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "articles": articles
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user articles: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/me/comments", response_model=UserCommentsResponse)
async def get_current_user_comments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get comments made by the current user
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get total count
        cursor.execute(
            """
            SELECT COUNT(*) as total
            FROM comments
            WHERE user_id = %s AND is_deleted = FALSE
            """,
            (current_user["user_id"],)
        )
        total = cursor.fetchone()["total"]
        
        # Get paginated comments
        cursor.execute(
            """
            SELECT 
                c.comment_id, c.article_id, c.text, c.created_at, c.parent_comment_id,
                a.title as article_title
            FROM 
                comments c
            JOIN 
                articles a ON c.article_id = a.article_id
            WHERE 
                c.user_id = %s AND c.is_deleted = FALSE
            ORDER BY 
                c.created_at DESC
            LIMIT %s OFFSET %s
            """,
            (current_user["user_id"], limit, (page - 1) * limit)
        )
        comments = []
        
        for comment in cursor.fetchall():
            # Get parent comment text if it's a reply
            parent_text = None
            if comment["parent_comment_id"]:
                cursor.execute(
                    """
                    SELECT c.text, u.username
                    FROM comments c
                    JOIN users u ON c.user_id = u.user_id
                    WHERE c.comment_id = %s
                    """,
                    (comment["parent_comment_id"],)
                )
                parent = cursor.fetchone()
                if parent:
                    parent_text = f"{parent['username']}: {parent['text']}"
            
            comments.append({
                "comment_id": comment["comment_id"],
                "article_id": comment["article_id"],
                "article_title": comment["article_title"],
                "text": comment["text"],
                "created_at": comment["created_at"].isoformat(),
                "parent_comment_id": comment["parent_comment_id"],
                "parent_text": parent_text
            })
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "comments": comments
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user comments: {str(e)}"
        )
    finally:
        cursor.close() 