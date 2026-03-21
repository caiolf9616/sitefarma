import os
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client

security = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifica o token JWT do Supabase e retorna o usuário.
    Usado para proteger rotas que requerem autenticação.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não fornecido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        user = supabase.auth.get_user(token)
        
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Erro ao validar token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Versão opcional - retorna None se não houver token.
    Útil para rotas que funcionam diferente para usuários autenticados.
    """
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def require_admin(user = Depends(get_current_user)):
    """
    Verifica se o usuário autenticado é admin.
    Deve ser usado após get_current_user.
    """
    from app.core.config import supabase
    
    try:
        profile = supabase.table("profiles").select("perfil").eq("id", user.id).single().execute()
        
        if not profile.data or profile.data.get("perfil") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Requer permissão de administrador."
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao verificar permissões"
        )
