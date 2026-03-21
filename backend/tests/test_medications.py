import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test that the health check returns online status"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"status": "online"}


class TestMedicationsAPI:
    """Test medications CRUD endpoints"""
    
    @patch('app.api.medications.supabase')
    def test_list_medications(self, mock_supabase):
        """Test listing all medications"""
        mock_response = MagicMock()
        mock_response.data = [
            {"id": "1", "name": "Dipirona", "available": True},
            {"id": "2", "name": "Paracetamol", "available": True}
        ]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        response = client.get("/medications/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @patch('app.api.medications.supabase')
    def test_get_medication_by_id(self, mock_supabase):
        """Test getting a medication by ID"""
        mock_response = MagicMock()
        mock_response.data = {"id": "1", "name": "Dipirona", "available": True}
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        response = client.get("/medications/1")
        assert response.status_code == 200
        assert response.json()["name"] == "Dipirona"
    
    @patch('app.api.medications.supabase')
    def test_get_medication_not_found(self, mock_supabase):
        """Test getting a medication that doesn't exist"""
        mock_response = MagicMock()
        mock_response.data = None
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        response = client.get("/medications/999")
        assert response.status_code == 404
        assert "não encontrado" in response.json()["detail"]
    
    @patch('app.api.medications.supabase')
    def test_delete_medication(self, mock_supabase):
        """Test deleting a medication"""
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.delete("/medications/1")
        assert response.status_code == 200
        assert "removido" in response.json()["message"]
