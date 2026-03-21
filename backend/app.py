from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Retorna conexão com PostgreSQL se DATABASE_URL estiver configurada"""
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        try:
            conn = psycopg2.connect(database_url)
            return conn
        except Exception as e:
            print(f"Erro ao conectar ao banco: {e}")
            return None
    return None

def normalizar_disponibilidade(valor):
    if not valor:
        return False
    return valor.strip().lower() == "sim"

def ler_medicamentos_csv():
    """Lê medicamentos do arquivo CSV (fallback)"""
    medicamentos = []
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        caminho_csv = os.path.join(BASE_DIR, 'medicamentos.csv')

        with open(caminho_csv, newline='', encoding='utf-8-sig') as arquivo:
            leitor = csv.DictReader(arquivo, delimiter=';')
            for linha in leitor:
                medicamentos.append({
                    "nome": linha.get("nome"),
                    "disponivel": normalizar_disponibilidade(linha.get("disponivel"))
                })
        return medicamentos
    except Exception as e:
        return {"erro": str(e)}

def ler_medicamentos():
    """Lê medicamentos do banco de dados ou CSV"""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT id, nome, disponivel FROM medicamentos ORDER BY nome")
            medicamentos = cur.fetchall()
            cur.close()
            conn.close()
            return [dict(med) for med in medicamentos]
        except Exception as e:
            conn.close()
            print(f"Erro ao ler do banco, usando CSV: {e}")
            return ler_medicamentos_csv()
    return ler_medicamentos_csv()

@app.route("/")
def home():
    return "API de Medicamentos está rodando!"

@app.route("/medicamentos", methods=["GET"])
def listar_medicamentos():
    return jsonify(ler_medicamentos())

@app.route("/medicamentos/<nome>", methods=["GET"])
def consultar_medicamento(nome):
    medicamentos = ler_medicamentos()

    if isinstance(medicamentos, dict) and "erro" in medicamentos:
        return jsonify(medicamentos), 500

    for med in medicamentos:
        if med.get("nome") and med["nome"].lower() == nome.lower():
            return jsonify(med)

    return jsonify({"erro": "Medicamento não encontrado"}), 404

@app.route("/medicamentos/<int:id>", methods=["GET"])
def obter_medicamento(id):
    """Obtém um medicamento pelo ID"""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT id, nome, disponivel FROM medicamentos WHERE id = %s", (id,))
            medicamento = cur.fetchone()
            cur.close()
            conn.close()
            if medicamento:
                return jsonify(dict(medicamento))
            return jsonify({"erro": "Medicamento não encontrado"}), 404
        except Exception as e:
            conn.close()
            return jsonify({"erro": str(e)}), 500
    return jsonify({"erro": "Banco de dados não configurado"}), 500

@app.route("/medicamentos", methods=["POST"])
def criar_medicamento():
    """Cria um novo medicamento"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"erro": "Banco de dados não configurado"}), 500
    
    try:
        dados = request.get_json()
        nome = dados.get("nome")
        disponivel = dados.get("disponivel", True)
        
        if not nome:
            return jsonify({"erro": "Nome é obrigatório"}), 400
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO medicamentos (nome, disponivel) VALUES (%s, %s) RETURNING id, nome, disponivel",
            (nome, disponivel)
        )
        medicamento = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(dict(medicamento)), 201
    except Exception as e:
        conn.close()
        return jsonify({"erro": str(e)}), 500

@app.route("/medicamentos/<int:id>", methods=["PUT"])
def atualizar_medicamento(id):
    """Atualiza um medicamento existente"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"erro": "Banco de dados não configurado"}), 500
    
    try:
        dados = request.get_json()
        nome = dados.get("nome")
        disponivel = dados.get("disponivel")
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "UPDATE medicamentos SET nome = %s, disponivel = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, nome, disponivel",
            (nome, disponivel, id)
        )
        medicamento = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if medicamento:
            return jsonify(dict(medicamento))
        return jsonify({"erro": "Medicamento não encontrado"}), 404
    except Exception as e:
        conn.close()
        return jsonify({"erro": str(e)}), 500

@app.route("/medicamentos/<int:id>", methods=["DELETE"])
def deletar_medicamento(id):
    """Deleta um medicamento"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"erro": "Banco de dados não configurado"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM medicamentos WHERE id = %s RETURNING id", (id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if deleted:
            return jsonify({"mensagem": "Medicamento deletado com sucesso"})
        return jsonify({"erro": "Medicamento não encontrado"}), 404
    except Exception as e:
        conn.close()
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)