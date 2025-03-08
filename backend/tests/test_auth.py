import pytest
from fastapi import status

def test_register_user(test_client, test_user):
    """Test user registration"""
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED
    user_data = response.json()
    assert user_data["username"] == test_user["username"]
    assert user_data["email"] == test_user["email"]

def test_register_duplicate_user(test_client, test_user):
    """Test registering a user with existing username"""
    # First register a user
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED

    # Try to register the same user again
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]

def test_login_user(test_client, test_user):
    """Test user login"""
    # First register the user
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED

    # Login
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"],
        "grant_type": "password"
    }
    response = test_client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert "user" in token_data

def test_login_invalid_credentials(test_client, test_user):
    """Test login with invalid credentials"""
    # First register the user
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED

    # Try to login with wrong password
    login_data = {
        "username": test_user["username"],
        "password": "wrongpassword",
        "grant_type": "password"
    }
    response = test_client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(test_client, test_user):
    """Test getting current user info"""
    # First register the user
    response = test_client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == status.HTTP_201_CREATED

    # Login to get token
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"],
        "grant_type": "password"
    }
    response = test_client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    access_token = token_data["access_token"]

    # Get current user info
    headers = {"Authorization": f"Bearer {access_token}"}
    response = test_client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    user_data = response.json()
    assert user_data["username"] == test_user["username"]
    assert user_data["email"] == test_user["email"]

def test_get_current_user_invalid_token(test_client):
    """Test getting current user info with invalid token"""
    headers = {"Authorization": "Bearer invalid_token"}
    response = test_client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 