import pytest
from fastapi import status

def test_get_articles_empty(test_client):
    """Test getting articles when none exist"""
    response = test_client.get("/api/v1/articles?status=Approved")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "articles" in data
    assert len(data["articles"]) == 0
    assert data["total"] == 0

@pytest.fixture
def auth_headers(test_client, test_user):
    """Get authentication headers for test user"""
    # First create a user
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED
    
    # Login to get access token
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"],
        "grant_type": "password"
    }
    response = test_client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    access_token = token_data["access_token"]
    
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def test_article_id(test_client, test_user, test_article, auth_headers):
    """Create a test article and return its ID"""
    response = test_client.post("/api/v1/articles", json=test_article, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()["article_id"]

def test_create_article(test_client, test_user, test_article, auth_headers):
    """Test article creation"""
    response = test_client.post("/api/v1/articles", json=test_article, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    article_data = response.json()
    
    # Verify article data
    assert article_data["title"] == test_article["title"]
    assert article_data["description"] == test_article["description"]
    assert article_data["category"] == test_article["category"]
    assert article_data["submitted_by"] == test_user["username"]
    assert article_data["status"] == "pending"

def test_get_articles_with_filter(test_client, test_article_id):
    """Test getting articles with status filter"""
    response = test_client.get("/api/v1/articles?status=pending")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "articles" in data
    assert len(data["articles"]) == 1
    assert data["total"] == 1
    assert data["articles"][0]["article_id"] == test_article_id

def test_get_article_by_id(test_client, test_article_id):
    """Test getting a specific article"""
    response = test_client.get(f"/api/v1/articles/{test_article_id}")
    assert response.status_code == status.HTTP_200_OK
    article = response.json()
    assert article["article_id"] == test_article_id

def test_update_article(test_client, test_article_id, auth_headers):
    """Test updating an article"""
    # Update article
    update_data = {
        "title": "Updated Test Article",
        "description": "This is an updated test article"
    }
    response = test_client.put(
        f"/api/v1/articles/{test_article_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    updated_article = response.json()
    assert updated_article["title"] == update_data["title"]
    assert updated_article["description"] == update_data["description"]

def test_delete_article(test_client, test_article_id, auth_headers):
    """Test deleting an article"""
    # Delete article
    response = test_client.delete(
        f"/api/v1/articles/{test_article_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Verify article is deleted
    response = test_client.get(f"/api/v1/articles/{test_article_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND 