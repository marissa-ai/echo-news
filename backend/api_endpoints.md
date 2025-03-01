# Echo News API Endpoints

This document outlines the API endpoints for the Echo news aggregator application based on the requirements document.

## Base URL

All endpoints are prefixed with `/api/v1`

## Authentication Endpoints

### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "user_id": "integer",
    "username": "string",
    "email": "string",
    "created_at": "datetime"
  }
  ```
- **Status Codes**:
  - `201`: User created successfully
  - `400`: Invalid input
  - `409`: Username or email already exists

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "user_id": "integer",
      "username": "string",
      "role": "string"
    }
  }
  ```
- **Status Codes**:
  - `200`: Login successful
  - `401`: Invalid credentials

### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "message": "Successfully logged out"
  }
  ```
- **Status Codes**:
  - `200`: Logout successful
  - `401`: Unauthorized

## Article Endpoints

### Submit Article

- **URL**: `/articles`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "url": "string",
    "category": "string",
    "tags": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "article_id": "integer",
    "title": "string",
    "description": "string",
    "url": "string",
    "category": "string",
    "tags": ["string"],
    "submitted_by": "string",
    "created_at": "datetime",
    "status": "string"
  }
  ```
- **Status Codes**:
  - `201`: Article submitted successfully
  - `400`: Invalid input
  - `401`: Unauthorized

### Get Articles

- **URL**: `/articles`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: Filter by category
  - `tag`: Filter by tag
  - `timeframe`: Filter by timeframe (day, week, month)
  - `sort`: Sort by (trending, newest, most_voted)
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "articles": [
      {
        "article_id": "integer",
        "title": "string",
        "description": "string",
        "url": "string",
        "category": "string",
        "tags": ["string"],
        "submitted_by": "string",
        "created_at": "datetime",
        "upvotes": "integer",
        "downvotes": "integer",
        "score": "integer"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `400`: Invalid parameters

### Get Article by ID

- **URL**: `/articles/{article_id}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "article_id": "integer",
    "title": "string",
    "description": "string",
    "url": "string",
    "category": "string",
    "tags": ["string"],
    "submitted_by": "string",
    "created_at": "datetime",
    "upvotes": "integer",
    "downvotes": "integer",
    "score": "integer",
    "comments": [
      {
        "comment_id": "integer",
        "text": "string",
        "user": {
          "user_id": "integer",
          "username": "string"
        },
        "created_at": "datetime"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `404`: Article not found

### Update Article

- **URL**: `/articles/{article_id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "category": "string",
    "tags": ["string"]
  }
  ```
- **Response**: Same as Get Article by ID
- **Status Codes**:
  - `200`: Article updated successfully
  - `400`: Invalid input
  - `401`: Unauthorized
  - `403`: Forbidden (not the article owner)
  - `404`: Article not found

### Delete Article

- **URL**: `/articles/{article_id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "message": "Article deleted successfully"
  }
  ```
- **Status Codes**:
  - `200`: Article deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden (not the article owner or admin)
  - `404`: Article not found

## Voting Endpoints

### Vote on Article

- **URL**: `/articles/{article_id}/vote`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "vote_type": "upvote | downvote | none"
  }
  ```
- **Response**:
  ```json
  {
    "article_id": "integer",
    "upvotes": "integer",
    "downvotes": "integer",
    "score": "integer",
    "user_vote": "upvote | downvote | none"
  }
  ```
- **Status Codes**:
  - `200`: Vote recorded successfully
  - `401`: Unauthorized
  - `404`: Article not found

### Get User's Vote on Article

- **URL**: `/articles/{article_id}/vote`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "article_id": "integer",
    "user_vote": "upvote | downvote | none"
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `401`: Unauthorized
  - `404`: Article not found

## Comment Endpoints

### Add Comment

- **URL**: `/articles/{article_id}/comments`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response**:
  ```json
  {
    "comment_id": "integer",
    "text": "string",
    "user": {
      "user_id": "integer",
      "username": "string"
    },
    "created_at": "datetime"
  }
  ```
- **Status Codes**:
  - `201`: Comment added successfully
  - `401`: Unauthorized
  - `404`: Article not found

### Get Comments

- **URL**: `/articles/{article_id}/comments`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "comments": [
      {
        "comment_id": "integer",
        "text": "string",
        "user": {
          "user_id": "integer",
          "username": "string"
        },
        "created_at": "datetime"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `404`: Article not found

### Update Comment

- **URL**: `/articles/{article_id}/comments/{comment_id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response**: Same as Add Comment
- **Status Codes**:
  - `200`: Comment updated successfully
  - `401`: Unauthorized
  - `403`: Forbidden (not the comment owner)
  - `404`: Comment or article not found

### Delete Comment

- **URL**: `/articles/{article_id}/comments/{comment_id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "message": "Comment deleted successfully"
  }
  ```
- **Status Codes**:
  - `200`: Comment deleted successfully
  - `401`: Unauthorized
  - `403`: Forbidden (not the comment owner or admin)
  - `404`: Comment or article not found

## User Profile Endpoints

### Get User Profile

- **URL**: `/users/{username}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "user_id": "integer",
    "username": "string",
    "created_at": "datetime",
    "reputation": "integer",
    "badges": ["string"],
    "articles_count": "integer",
    "comments_count": "integer"
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `404`: User not found

### Get User's Articles

- **URL**: `/users/{username}/articles`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
- **Response**: Same as Get Articles
- **Status Codes**:
  - `200`: Success
  - `404`: User not found

### Get User's Comments

- **URL**: `/users/{username}/comments`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "comments": [
      {
        "comment_id": "integer",
        "text": "string",
        "article": {
          "article_id": "integer",
          "title": "string"
        },
        "created_at": "datetime"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `404`: User not found

### Update User Profile

- **URL**: `/users/me`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "notification_preferences": {
      "email_notifications": "boolean",
      "push_notifications": "boolean"
    }
  }
  ```
- **Response**:
  ```json
  {
    "user_id": "integer",
    "username": "string",
    "email": "string",
    "notification_preferences": {
      "email_notifications": "boolean",
      "push_notifications": "boolean"
    }
  }
  ```
- **Status Codes**:
  - `200`: Profile updated successfully
  - `400`: Invalid input
  - `401`: Unauthorized

## Category and Tag Endpoints

### Get Categories

- **URL**: `/categories`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "categories": [
      {
        "id": "integer",
        "name": "string",
        "description": "string",
        "articles_count": "integer"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success

### Get Tags

- **URL**: `/tags`
- **Method**: `GET`
- **Query Parameters**:
  - `search`: Search term
  - `limit`: Maximum number of tags to return
- **Response**:
  ```json
  {
    "tags": [
      {
        "id": "integer",
        "name": "string",
        "articles_count": "integer"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success

## Search Endpoint

### Search Articles

- **URL**: `/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q`: Search query
  - `category`: Filter by category
  - `tag`: Filter by tag
  - `sort`: Sort by (relevance, newest, most_voted)
  - `page`: Page number
  - `limit`: Items per page
- **Response**: Same as Get Articles
- **Status Codes**:
  - `200`: Success
  - `400`: Invalid parameters

## Admin Endpoints

### Moderate Article

- **URL**: `/admin/articles/{article_id}/moderate`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "action": "approve | reject | feature",
    "reason": "string"
  }
  ```
- **Response**:
  ```json
  {
    "article_id": "integer",
    "status": "string",
    "moderated_by": "string",
    "moderated_at": "datetime"
  }
  ```
- **Status Codes**:
  - `200`: Moderation action successful
  - `401`: Unauthorized
  - `403`: Forbidden (not an admin)
  - `404`: Article not found

### Get User Management

- **URL**: `/admin/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `search`: Search term
  - `role`: Filter by role
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "users": [
      {
        "user_id": "integer",
        "username": "string",
        "email": "string",
        "role": "string",
        "created_at": "datetime",
        "last_login": "datetime",
        "status": "active | suspended | banned"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden (not an admin)

### Manage User

- **URL**: `/admin/users/{user_id}`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "action": "suspend | unsuspend | ban | unban | promote | demote",
    "reason": "string",
    "duration": "integer" // For suspend action, in days
  }
  ```
- **Response**:
  ```json
  {
    "user_id": "integer",
    "username": "string",
    "status": "string",
    "role": "string"
  }
  ```
- **Status Codes**:
  - `200`: User management action successful
  - `401`: Unauthorized
  - `403`: Forbidden (not an admin)
  - `404`: User not found

## Analytics Endpoints

### Get Article Analytics

- **URL**: `/analytics/articles/{article_id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "article_id": "integer",
    "title": "string",
    "views": "integer",
    "upvotes": "integer",
    "downvotes": "integer",
    "comments": "integer",
    "shares": "integer",
    "view_history": [
      {
        "date": "date",
        "views": "integer"
      }
    ],
    "vote_history": [
      {
        "date": "date",
        "upvotes": "integer",
        "downvotes": "integer"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden (not the article owner or admin)
  - `404`: Article not found

### Get Site Analytics

- **URL**: `/admin/analytics`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `timeframe`: Timeframe (day, week, month, year)
- **Response**:
  ```json
  {
    "users": {
      "total": "integer",
      "new": "integer",
      "active": "integer"
    },
    "articles": {
      "total": "integer",
      "new": "integer",
      "pending": "integer",
      "approved": "integer",
      "rejected": "integer"
    },
    "votes": {
      "total": "integer",
      "upvotes": "integer",
      "downvotes": "integer"
    },
    "comments": {
      "total": "integer",
      "new": "integer"
    },
    "popular_categories": [
      {
        "name": "string",
        "articles_count": "integer",
        "views": "integer"
      }
    ],
    "popular_tags": [
      {
        "name": "string",
        "articles_count": "integer",
        "views": "integer"
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `401`: Unauthorized
  - `403`: Forbidden (not an admin) 