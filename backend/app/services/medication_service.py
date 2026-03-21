from app.core.config import supabase
from app.schemas.medication_schema import MedicationCreate, MedicationUpdate

class MedicationService:
    @staticmethod
    def list_all():
        return supabase.table("medications").select("*").execute().data

    @staticmethod
    def get_by_id(med_id: str):
        return supabase.table("medications").select("*").eq("id", med_id).single().execute().data

    @staticmethod
    def create(data: MedicationCreate):
        return supabase.table("medications").insert(data.model_dump()).execute().data

    @staticmethod
    def update(med_id: str, data: MedicationUpdate):
        update_data = data.model_dump(exclude_unset=True)
        return supabase.table("medications").update(update_data).eq("id", med_id).execute().data

    @staticmethod
    def delete(med_id: str):
        return supabase.table("medications").delete().eq("id", med_id).execute().data