from app.core.config import supabase
from app.schemas.user_schema import UserCreate, ProfileUpdate
from fastapi import HTTPException

class AuthService:
    @staticmethod
    def create_user_and_profile(data: UserCreate):
        try:
            # 1. Cria o usuário no Auth (aciona o trigger SQL automaticamente)
            auth_res = supabase.auth.admin.create_user({
                "email": data.email,
                "password": data.password,
                "user_metadata": {"name": data.name},
                "email_confirm": True
            })

            user_id = auth_res.user.id

            # 2. Se for admin, precisamos atualizar o perfil 
            # (já que o trigger SQL define como 'user' por padrão)
            if data.perfil == 'admin':
                supabase.table("profiles").update({"perfil": "admin"}).eq("id", user_id).execute()

            return {"id": user_id, "email": data.email, "status": "success"}
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")

    @staticmethod
    def list_profiles():
        return supabase.table("profiles").select("*").execute().data

    @staticmethod
    def get_profile(user_id: str):
        return supabase.table("profiles").select("*").eq("id", user_id).single().execute().data

    @staticmethod
    def update_profile(user_id: str, data: ProfileUpdate):
        update_data = data.model_dump(exclude_unset=True)
        return supabase.table("profiles").update(update_data).eq("id", user_id).execute().data

    @staticmethod
    def delete_account(user_id: str):
        # Deletar no auth remove o perfil devido ao ON DELETE CASCADE no SQL
        return supabase.auth.admin.delete_user(user_id)