from flask import Flask, jsonify
from flask_cors import CORS
import csv

app = Flask(__name__)
CORS(app)

def carregar_medicamentos():
    medicamentos = []
    with open("medicamentos.csv", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            medicamentos.append(row)
    return medicamentos

@app.route("/")
def home():
    return "API de Medicamentos está rodando!"

@app.route("/medicamentos", methods=["GET"])
def listar_medicamentos():
    return jsonify(carregar_medicamentos())

@app.route("/medicamentos/<nome>", methods=["GET"])
def consultar_medicamento(nome):
    medicamentos = carregar_medicamentos()
    for med in medicamentos:
        if med["nome"].lower() == nome.lower():
            return jsonify(med)
    return jsonify({"erro": "Medicamento não encontrado"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
