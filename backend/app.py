from flask import Flask, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)
CORS(app)

def normalizar_disponibilidade(valor):
    if not valor:
        return False
    return valor.strip().lower() == "sim"

def ler_medicamentos():
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)