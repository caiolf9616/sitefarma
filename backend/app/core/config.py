import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


class Settings:
    """Configurações da aplicação com suporte a múltiplos ambientes"""
    
    PROJECT_NAME: str = "Sistema Farmácia"
    VERSION: str = "1.0.0"
    
    # Ambiente: development, staging, production
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # URL do frontend (usada como redirect em emails de reset de senha)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # CORS - origens permitidas (separadas por vírgula)
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()

# Validação de configurações obrigatórias
if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
    if settings.is_production:
        raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em produção")
    else:
        print("⚠️  Aviso: Variáveis do Supabase não configuradas. Alguns recursos podem não funcionar.")

# Cliente Supabase
supabase: Client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)