from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.core.config import settings
from app.db.session import get_db

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LogoutResponse(BaseModel):
    message: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db = Depends(get_db)):
    """
    Register a new user
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Check if username already exists
        cursor.execute("SELECT user_id FROM users WHERE username = %s", (user.username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        
        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Insert new user
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING user_id, username, email, created_at
            """,
            (user.username, user.email, hashed_password)
        )
        new_user = cursor.fetchone()
        
        # Create user preferences
        cursor.execute(
            "INSERT INTO user_preferences (user_id) VALUES (%s)",
            (new_user["user_id"],)
        )
        
        # Award "New Member" badge
        cursor.execute(
            """
            INSERT INTO user_badges (user_id, badge_id)
            SELECT %s, badge_id FROM badges WHERE name = 'New Member'
            RETURNING badge_id
            """,
            (new_user["user_id"],)
        )
        badge = cursor.fetchone()
        if not badge:
            print(f"Warning: Could not find 'New Member' badge")
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type)
            VALUES (%s, %s)
            """,
            (new_user["user_id"], "register")
        )
        
        db.commit()
        
        return {
            "user_id": new_user["user_id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "created_at": new_user["created_at"].isoformat()
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        print(f"Error in register_user: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )
    finally:
        if 'cursor' in locals():
            cursor.close()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    """
    Authenticate and login a user
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Fetch user by username
        cursor.execute(
            "SELECT user_id, username, password_hash, role FROM users WHERE username = %s",
            (form_data.username,)
        )
        user = cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login timestamp
        cursor.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = %s",
            (user["user_id"],)
        )
        
        # Log user activity
        cursor.execute(
            """
            INSERT INTO user_activity (user_id, activity_type)
            VALUES (%s, %s)
            """,
            (user["user_id"], "login")
        )
        
        db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        user_data = {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"]
        }
        access_token = create_access_token(
            subject=user_data, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to login: {str(e)}"
        )
    finally:
        cursor.close()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    """Get current user information"""
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT user_id, username, email, created_at
            FROM users
            WHERE user_id = %s
            """,
            (current_user["user_id"],)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"].isoformat()
        }
    finally:
        cursor.close()

@router.post("/logout", response_model=LogoutResponse)
async def logout(db = Depends(get_db)):
    """
    Logout a user
    
    Note: With JWT tokens, the actual logout happens on the client side by removing the token.
    This endpoint is provided for logging purposes.
    """
    return {"message": "Successfully logged out"} 