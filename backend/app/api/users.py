from fastapi import APIRouter, HTTPException, Depends
from app.core.config import supabase, settings
from app.schemas.user_schema import UserCreate, UserLogin, ProfileUpdate, PasswordResetRequest, PasswordReset
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Usuários"])

@router.post("/login")
def login(payload: UserLogin):
    """Autentica um usuário e retorna o token de acesso"""
    try:
        auth_res = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        if not auth_res.user:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        # Buscar perfil do banco
        profile_res = supabase.table("profiles").select("*").eq("id", auth_res.user.id).single().execute()
        profile = profile_res.data or {}

        return {
            "access_token": auth_res.session.access_token,
            "user": {
                "id": auth_res.user.id,
                "email": auth_res.user.email,
                "name": profile.get("name", ""),
                "cpf": profile.get("cpf", ""),
                "perfil": profile.get("perfil", "user")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")
        raise HTTPException(status_code=400, detail=error_msg)

@router.post("/signup", status_code=201)
def signup(payload: UserCreate):
    """Cria um novo usuário - Acesso público"""
    try:
        # Verificar se CPF já existe
        existing = supabase.table("profiles").select("id").eq("cpf", payload.cpf).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="CPF já cadastrado")

        # Verificar se email já existe
        existing_email = supabase.table("profiles").select("id").eq("email", payload.email).execute()
        if existing_email.data:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        auth_res = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
            "options": {
                "data": {
                    "name": payload.name,
                    "cpf": payload.cpf,
                    "perfil": payload.perfil
                }
            }
        })

        if not auth_res.user:
            raise HTTPException(status_code=400, detail="Erro ao criar usuário. Verifique os dados informados.")

        # Inserir perfil na tabela profiles
        supabase.table("profiles").insert({
            "id": auth_res.user.id,
            "name": payload.name,
            "email": payload.email,
            "cpf": payload.cpf,
            "perfil": payload.perfil or "user"
        }).execute()

        return {"id": auth_res.user.id, "message": "Usuário criado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_profiles(user = Depends(require_admin)):
    """Lista todos os perfis - Requer Admin"""
    response = supabase.table("profiles").select("*").execute()
    return response.data

@router.get("/me")
def get_my_profile(user = Depends(get_current_user)):
    """Retorna o perfil do usuário autenticado"""
    try:
        response = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        if response.data:
            return {
                "id": response.data.get("id", user.id),
                "email": response.data.get("email", user.email or ""),
                "name": response.data.get("name", ""),
                "cpf": response.data.get("cpf", ""),
                "perfil": response.data.get("perfil", "user")
            }
    except Exception:
        pass
    
    # Fallback: usar user_metadata do token
    meta = user.user_metadata or {}
    name = meta.get("name", "")
    email = user.email or ""
    if not name and not email:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return {
        "id": user.id,
        "email": email,
        "name": name,
        "cpf": meta.get("cpf", ""),
        "perfil": meta.get("perfil", "user")
    }

@router.get("/{user_id}")
def get_profile(user_id: str, user = Depends(get_current_user)):
    """Busca um perfil por ID - Requer autenticação"""
    response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return response.data

@router.delete("/{user_id}")
def delete_user(user_id: str, user = Depends(require_admin)):
    """Deleta um usuário - Requer Admin"""
    try:
        supabase.auth.admin.delete_user(user_id)
        return {"message": "Usuário deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao deletar usuário")

@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest):
    """Envia email de redefinição de senha"""
    try:
        redirect_url = f"{settings.FRONTEND_URL}/redefinir-senha"
        supabase.auth.reset_password_for_email(
            payload.email,
            options={"redirect_to": redirect_url}
        )
        # Retorna sempre sucesso para não vazar quais emails estão cadastrados
        return {"message": "Se o email estiver cadastrado, você receberá as instruções em breve."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset-password")
def reset_password(payload: PasswordReset):
    """Redefine a senha usando o token de recuperação"""
    try:
        # Verificar token e obter usuário
        user_res = supabase.auth.get_user(payload.access_token)
        if not user_res.user:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        user_id = user_res.user.id
        # Atualizar senha via admin
        supabase.auth.admin.update_user_by_id(user_id, {"password": payload.new_password})
        return {"message": "Senha redefinida com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "expired" in error_msg.lower() or "invalid" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        raise HTTPException(status_code=400, detail=error_msg)