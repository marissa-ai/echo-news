import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from psycopg2.extras import RealDictCursor
import psycopg2
import os

from app.main import app
from app.core.config import settings
from app.db.session import get_db

# Test database URL
TEST_DATABASE_URL = "postgresql://postgres:password123@localhost:5432/echo_test"

@pytest.fixture(scope="session")
def test_db():
    """Create a test database and return the connection"""
    # Connect to default PostgreSQL database
    conn = psycopg2.connect(
        dbname="postgres",
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        cursor_factory=RealDictCursor
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Create test database
    try:
        cursor.execute("DROP DATABASE IF EXISTS echo_test")
        cursor.execute("CREATE DATABASE echo_test")
    finally:
        cursor.close()
        conn.close()

    # Connect to test database and set up schema
    conn = psycopg2.connect(
        dbname="echo_test",
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        cursor_factory=RealDictCursor
    )
    
    # Execute schema SQL file
    cursor = conn.cursor()
    try:
        with open(os.path.join(os.path.dirname(__file__), '..', 'database_schema.sql'), 'r') as f:
            cursor.execute(f.read())
        conn.commit()
    except Exception as e:
        print(f"Error setting up test database schema: {e}")
        raise
    finally:
        cursor.close()

    yield conn

    # Cleanup after all tests
    conn.close()

@pytest.fixture
def db_connection(test_db):
    """Create a fresh connection for each test"""
    conn = psycopg2.connect(
        dbname="echo_test",
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        cursor_factory=RealDictCursor
    )
    conn.autocommit = False
    
    # Clean up data from previous test
    cursor = conn.cursor()
    try:
        cursor.execute("TRUNCATE users, articles, comments, votes, user_badges, user_preferences CASCADE")
        
        # Insert initial data
        cursor.execute("""
            INSERT INTO badges (name, description, icon)
            VALUES 
                ('New Member', 'Awarded to new members upon registration', 'new_member.png'),
                ('First Article', 'Awarded for submitting your first article', 'first_article.png')
            ON CONFLICT (name) DO NOTHING
        """)
        
        cursor.execute("""
            INSERT INTO categories (name, description)
            VALUES 
                ('Technology', 'Technology news and updates'),
                ('Science', 'Scientific discoveries and research'),
                ('World', 'World news and events')
            ON CONFLICT (name) DO NOTHING
        """)
        
        conn.commit()
    except Exception as e:
        print(f"Error setting up test data: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
    
    yield conn
    conn.rollback()
    conn.close()

@pytest.fixture
def test_client(db_connection):
    """Create a test client with test database"""
    def get_test_db():
        try:
            yield db_connection
        finally:
            pass  # Let the fixture handle rollback

    app.dependency_overrides[get_db] = get_test_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user():
    """Return test user data"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }

@pytest.fixture
def test_article():
    """Return test article data"""
    return {
        "title": "Test Article",
        "description": "This is a test article",
        "url": "https://example.com/test",
        "category": "Technology",
        "tags": ["test", "pytest"]
    } 