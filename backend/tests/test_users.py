import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


class TestUsersAPI:
    """Test users endpoints"""
    
    @patch('app.api.users.supabase')
    def test_list_profiles(self, mock_supabase):
        """Test listing all user profiles"""
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "1", "name": "Admin", "perfil": "admin"},
            {"id": "2", "name": "User", "perfil": "user"}
        ]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        response = client.get("/users/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @patch('app.api.users.supabase')
    def test_get_profile_by_id(self, mock_supabase):
        """Test getting a user profile by ID"""
        mock_response = MagicMock()
        mock_response.data = {"id": "1", "name": "Admin", "perfil": "admin"}
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        response = client.get("/users/1")
        assert response.status_code == 200
        assert response.json()["name"] == "Admin"
    
    @patch('app.api.users.supabase')
    def test_get_profile_not_found(self, mock_supabase):
        """Test getting a profile that doesn't exist"""
        mock_response = MagicMock()
        mock_response.data = None
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        response = client.get("/users/999")
        assert response.status_code == 404
    
    def test_signup_invalid_email(self):
        """Test signup with invalid email"""
        payload = {
            "name": "Test User",
            "email": "not-an-email",
            "password": "securepassword123",
            "perfil": "user"
        }
        
        response = client.post("/users/signup", json=payload)
        assert response.status_code == 422  # Validation error
