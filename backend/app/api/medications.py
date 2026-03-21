from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.config import supabase
from app.schemas.medication_schema import MedicationCreate, MedicationUpdate
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/medications", tags=["Medicamentos"])

@router.get("/")
def list_meds():
    """Lista todos os medicamentos - Acesso público"""
    response = supabase.table("medications").select("*").execute()
    return response.data

@router.get("/{med_id}")
def get_med(med_id: str):
    """Busca um medicamento por ID - Acesso público"""
    response = supabase.table("medications").select("*").eq("id", med_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    return response.data

@router.post("/", status_code=201)
def create_med(payload: MedicationCreate, user = Depends(require_admin)):
    """Cria um novo medicamento - Requer Admin"""
    response = supabase.table("medications").insert(payload.model_dump()).execute()
    return response.data

@router.put("/{med_id}")
def update_med(med_id: str, payload: MedicationUpdate, user = Depends(require_admin)):
    """Atualiza um medicamento - Requer Admin"""
    response = supabase.table("medications").update(
        payload.model_dump(exclude_unset=True)
    ).eq("id", med_id).execute()
    return response.data

@router.delete("/{med_id}")
def delete_med(med_id: str, user = Depends(require_admin)):
    """Deleta um medicamento - Requer Admin"""
    supabase.table("medications").delete().eq("id", med_id).execute()
    return {"message": "Medicamento removido com sucesso"}