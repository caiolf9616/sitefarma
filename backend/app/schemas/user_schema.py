from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
import re

class UserCreate(BaseModel):
    cpf: str
    name: str
    email: EmailStr
    password: str
    perfil: Literal['admin', 'user'] = 'user'
    
    @field_validator('cpf')
    @classmethod
    def validate_cpf(cls, v: str) -> str:
        # Remove caracteres não numéricos
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        # Verifica se todos os dígitos são iguais
        if len(set(cpf)) == 1:
            raise ValueError('CPF inválido')
        return cpf

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    cpf: Optional[str] = None
    name: Optional[str] = None
    perfil: Optional[Literal['admin', 'user']] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    access_token: str
    new_password: str