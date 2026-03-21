from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from app.core.config import supabase
from app.schemas.reservation_schema import ReservationCreate, ReservationUpdate
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/reservations", tags=["Reservas"])

MAX_RESERVATIONS = 3
MAX_QUANTITY = 5

def get_today_end():
    """Retorna o fim do dia atual (23:59:59)"""
    today = datetime.now().replace(hour=23, minute=59, second=59, microsecond=0)
    return today.isoformat()

def get_today_start():
    """Retorna o início do dia atual (00:00:00)"""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return today.isoformat()

@router.post("/", status_code=201)
def create_reservation(payload: ReservationCreate, user = Depends(get_current_user)):
    """Cria uma nova reserva - Requer autenticação"""
    try:
        med_response = supabase.table("medications").select("*").eq("id", payload.medication_id).single().execute()
        if not med_response.data:
            raise HTTPException(status_code=404, detail="Medicamento não encontrado")
        
        if not med_response.data.get("available", False):
            raise HTTPException(status_code=400, detail="Medicamento não está disponível")
        
        stock = med_response.data.get("quantity", 0)
        if stock <= 0:
            raise HTTPException(status_code=400, detail="Medicamento sem estoque")
        
        if payload.quantity > stock:
            raise HTTPException(status_code=400, detail=f"Quantidade solicitada ({payload.quantity}) excede o estoque disponível ({stock})")
        
        if payload.quantity > MAX_QUANTITY:
            raise HTTPException(status_code=400, detail=f"Quantidade máxima por medicamento é de {MAX_QUANTITY} unidades")
        
        today_start = get_today_start()
        existing = supabase.table("reservations").select("id, medication_id").eq("user_id", user.id).eq("status", "pending").gte("created_at", today_start).execute()
        
        if existing.data:
            # Verificar duplicata de medicamento
            for res in existing.data:
                if res["medication_id"] == payload.medication_id:
                    raise HTTPException(status_code=400, detail="Você já possui uma reserva ativa para este medicamento hoje")
            
            # Verificar limite de reservas
            if len(existing.data) >= MAX_RESERVATIONS:
                raise HTTPException(status_code=400, detail=f"Você atingiu o limite de {MAX_RESERVATIONS} reservas por dia")
        
        reservation_data = {
            "user_id": user.id,
            "user_name": (user.user_metadata or {}).get("name", "") if user.user_metadata else "",
            "user_email": user.email or "",
            "medication_id": payload.medication_id,
            "quantity": payload.quantity,
            "status": "pending",
            "expires_at": get_today_end()
        }
        
        response = supabase.table("reservations").insert(reservation_data).execute()
        
        return response.data[0] if response.data else {"message": "Reserva criada com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar reserva: {str(e)}")

@router.get("/my")
def get_my_reservations(user = Depends(get_current_user)):
    """Lista as reservas do usuário do dia atual"""
    today_start = get_today_start()
    
    response = supabase.table("reservations").select(
        "*, medications(*)"
    ).eq("user_id", user.id).gte("created_at", today_start).order("created_at", desc=True).execute()
    
    return response.data

@router.get("/")
def list_all_reservations(user = Depends(require_admin)):
    """Lista todas as reservas - Requer Admin"""
    today_start = get_today_start()
    
    response = supabase.table("reservations").select(
        "*, medications(*)"
    ).gte("created_at", today_start).order("created_at", desc=True).execute()
    
    reservations = response.data or []
    
    # Montar profiles a partir dos dados salvos na reserva
    for r in reservations:
        r["profiles"] = {
            "id": r["user_id"],
            "name": r.get("user_name") or "Usuário",
            "email": r.get("user_email") or "",
            "perfil": "user"
        }
    
    return reservations

@router.put("/{reservation_id}")
def update_reservation(reservation_id: str, payload: ReservationUpdate, user = Depends(get_current_user)):
    """Atualiza a quantidade de uma reserva - Requer autenticação"""
    reservation = supabase.table("reservations").select("*").eq("id", reservation_id).single().execute()
    
    if not reservation.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if reservation.data["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar esta reserva")
    
    if reservation.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Apenas reservas pendentes podem ser editadas")
    
    if payload.quantity > MAX_QUANTITY:
        raise HTTPException(status_code=400, detail=f"Quantidade máxima por medicamento é de {MAX_QUANTITY} unidades")
    
    med_response = supabase.table("medications").select("quantity").eq("id", reservation.data["medication_id"]).single().execute()
    if med_response.data and payload.quantity > med_response.data.get("quantity", 0):
        raise HTTPException(status_code=400, detail=f"Quantidade solicitada ({payload.quantity}) excede o estoque disponível ({med_response.data.get('quantity', 0)})")
    
    response = supabase.table("reservations").update({"quantity": payload.quantity}).eq("id", reservation_id).execute()
    
    return response.data[0] if response.data else {"message": "Reserva atualizada com sucesso"}

@router.delete("/{reservation_id}")
def delete_reservation(reservation_id: str, user = Depends(get_current_user)):
    """Exclui uma reserva pendente - Requer autenticação"""
    reservation = supabase.table("reservations").select("*").eq("id", reservation_id).single().execute()
    
    if not reservation.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if reservation.data["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para excluir esta reserva")
    
    if reservation.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Apenas reservas pendentes podem ser excluídas")
    
    supabase.table("reservations").delete().eq("id", reservation_id).execute()
    
    return {"message": "Reserva excluída com sucesso"}

@router.patch("/{reservation_id}/cancel")
def cancel_reservation(reservation_id: str, user = Depends(get_current_user)):
    """Cancela uma reserva do usuário"""
    reservation = supabase.table("reservations").select("*").eq("id", reservation_id).single().execute()
    
    if not reservation.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if reservation.data["user_id"] != user.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta reserva")
    
    if reservation.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Apenas reservas pendentes podem ser canceladas")
    
    response = supabase.table("reservations").update({
        "status": "cancelled",
        "cancelled_by": "user"
    }).eq("id", reservation_id).execute()
    
    return {"message": "Reserva cancelada com sucesso"}

@router.patch("/{reservation_id}/admin-cancel")
def admin_cancel_reservation(reservation_id: str, user = Depends(require_admin)):
    """Admin cancela uma reserva por problema de estoque"""
    reservation = supabase.table("reservations").select("*").eq("id", reservation_id).single().execute()
    
    if not reservation.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if reservation.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Apenas reservas pendentes podem ser canceladas")
    
    response = supabase.table("reservations").update({
        "status": "cancelled",
        "cancelled_by": "pharmacy"
    }).eq("id", reservation_id).execute()
    
    return {"message": "Reserva cancelada pela farmácia"}

@router.patch("/{reservation_id}/complete")
def complete_reservation(reservation_id: str, user = Depends(require_admin)):
    """Marca uma reserva como concluída - Requer Admin"""
    reservation = supabase.table("reservations").select("*").eq("id", reservation_id).single().execute()
    
    if not reservation.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if reservation.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Apenas reservas pendentes podem ser concluídas")
    
    # Dar baixa no estoque do medicamento
    med_id = reservation.data["medication_id"]
    qty = reservation.data["quantity"]
    med = supabase.table("medications").select("quantity").eq("id", med_id).single().execute()
    if med.data:
        new_stock = max(0, med.data["quantity"] - qty)
        update_data = {"quantity": new_stock}
        if new_stock == 0:
            update_data["available"] = False
        supabase.table("medications").update(update_data).eq("id", med_id).execute()
    
    response = supabase.table("reservations").update({"status": "completed"}).eq("id", reservation_id).execute()
    
    return {"message": "Reserva concluída com sucesso"}
