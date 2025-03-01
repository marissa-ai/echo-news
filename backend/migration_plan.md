# Migration Plan: Flask to FastAPI

## Overview
This document outlines the step-by-step process to migrate the Echo news aggregator backend from Flask to FastAPI, as specified in the requirements document.

## Benefits of Migration
- **Performance**: FastAPI is significantly faster than Flask due to its asynchronous capabilities
- **Type Checking**: FastAPI uses Pydantic for request/response validation and type checking
- **Documentation**: Automatic OpenAPI (Swagger) documentation generation
- **Modern Features**: Built-in support for WebSockets, async/await, dependency injection

## Migration Steps

### 1. Setup and Dependencies

**Current Dependencies**:
- Flask
- flask-cors
- werkzeug.security
- psycopg2-binary

**New Dependencies**:
```
fastapi==0.95.0
uvicorn==0.21.1
pydantic==1.10.7
python-jose==3.3.0  # For JWT tokens
passlib==1.7.4      # For password hashing
python-multipart    # For form data
psycopg2-binary     # Keep existing database connector
```

### 2. Project Structure Reorganization

**Current Structure**:
- `app.py` - Main Flask application
- `db_connection.py` - Database connection utility

**New Structure**:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── endpoints/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py   # Authentication endpoints
│   │   │   ├── articles.py
│   │   │   └── votes.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py     # Configuration settings
│   │   └── security.py   # Authentication utilities
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py    # Database session management
│   │   └── models.py     # SQLAlchemy models (optional)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── article.py    # Pydantic models for articles
│   │   └── user.py       # Pydantic models for users
├── requirements.txt
└── .env                  # Environment variables
```

### 3. Code Migration Strategy

#### 3.1 Entry Point (main.py)

**From Flask**:
```python
app = Flask(__name__)
CORS(app)
```

**To FastAPI**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Echo News API",
    description="API for Echo news aggregator",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3.2 Route Migration

**From Flask**:
```python
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    # ...
```

**To FastAPI**:
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

class LoginRequest(BaseModel):
    login_name: str
    password: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # ...
```

#### 3.3 Database Connection

**From direct psycopg2**:
```python
conn = connect_to_db()
cur = conn.cursor()
```

**To dependency injection**:
```python
from fastapi import Depends
from app.db.session import get_db

@router.post("/articles")
async def create_article(article: ArticleCreate, db = Depends(get_db)):
    # Use db connection
```

### 4. Authentication Upgrade

- Replace Werkzeug password hashing with Passlib
- Implement JWT token-based authentication
- Create proper user roles and permissions

### 5. Testing Strategy

1. Create unit tests for each endpoint
2. Implement integration tests
3. Compare performance between Flask and FastAPI implementations

### 6. Deployment Changes

1. Replace Flask's development server with Uvicorn
2. Update deployment scripts/configurations
3. Set up proper environment variables

## Implementation Timeline

1. **Week 1**: Setup project structure and dependencies
2. **Week 2**: Migrate core endpoints (auth, articles)
3. **Week 3**: Migrate remaining endpoints and implement new features
4. **Week 4**: Testing, documentation, and deployment

## Rollback Plan

In case of issues during migration:
1. Keep both implementations running in parallel initially
2. Implement feature flags to control which implementation handles requests
3. Maintain database compatibility between both implementations 