import hashlib
import re
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS

from baterias import (
    calcular_soh,
    cadastrar_bateria_no_banco,
    campos_faltando,
    criar_tabela_baterias,
    listar_baterias_do_usuario,
    listar_todas_baterias,
)


NOME_BANCO = "usuarios.db"

app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
])


def conectar_banco():
    banco = sqlite3.connect(NOME_BANCO)
    banco.row_factory = sqlite3.Row
    return banco


def criar_tabela_usuarios():
    banco = conectar_banco()
    cursor = banco.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )
    """)

    banco.commit()
    banco.close()


def email_valido(email):
    padrao = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(padrao, email or "") is not None


def gerar_hash_senha(senha):
    return hashlib.sha256(senha.encode("utf-8")).hexdigest()


def usuario_sem_senha(usuario):
    return {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
    }


@app.route("/", methods=["GET"])
def inicio():
    return jsonify({"mensagem": "Backend EcoVolt rodando"})


@app.route("/cadastro", methods=["POST"])
def cadastrar_usuario():
    dados = request.get_json() or {}
    faltando = campos_faltando(dados, ["nome", "email", "senha"])

    if faltando:
        return jsonify({"erro": "Campos obrigatórios: " + ", ".join(faltando)}), 400

    nome = dados["nome"].strip()
    email = dados["email"].strip().lower()
    senha = dados["senha"]

    if not email_valido(email):
        return jsonify({"erro": "E-mail inválido"}), 400

    banco = conectar_banco()
    cursor = banco.cursor()

    try:
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            (nome, email, gerar_hash_senha(senha)),
        )
        banco.commit()
        usuario_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        banco.close()
        return jsonify({"erro": "E-mail já cadastrado"}), 409

    usuario = banco.execute(
        "SELECT id, nome, email FROM usuarios WHERE id = ?",
        (usuario_id,),
    ).fetchone()
    banco.close()

    return jsonify({
        "mensagem": "Usuário cadastrado com sucesso",
        "usuario": usuario_sem_senha(usuario),
    }), 201


@app.route("/login", methods=["POST"])
def login_usuario():
    dados = request.get_json() or {}
    faltando = campos_faltando(dados, ["email", "senha"])

    if faltando:
        return jsonify({"erro": "Campos obrigatórios: " + ", ".join(faltando)}), 400

    email = dados["email"].strip().lower()
    senha = dados["senha"]

    banco = conectar_banco()
    usuario = banco.execute(
        "SELECT id, nome, email, senha FROM usuarios WHERE email = ?",
        (email,),
    ).fetchone()
    banco.close()

    if usuario is None or usuario["senha"] != gerar_hash_senha(senha):
        return jsonify({"erro": "E-mail ou senha inválidos"}), 401

    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "usuario": usuario_sem_senha(usuario),
    })


@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    banco = conectar_banco()
    usuarios = banco.execute("SELECT id, nome, email FROM usuarios ORDER BY id").fetchall()
    banco.close()
    return jsonify([usuario_sem_senha(usuario) for usuario in usuarios])


@app.route("/simulador/soh", methods=["POST"])
def simular_soh():
    dados = request.get_json() or {}
    faltando = campos_faltando(dados, ["fabricante", "modelo", "ano", "cap_original", "cap_atual", "ciclos"])

    if faltando:
        return jsonify({"erro": "Campos obrigatórios: " + ", ".join(faltando)}), 400

    try:
        resultado = calcular_soh(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    return jsonify(resultado)


@app.route("/baterias", methods=["POST"])
def cadastrar_bateria():
    dados = request.get_json() or {}
    faltando = campos_faltando(dados, ["usuario_id", "fabricante", "modelo", "ano", "cap_original", "cap_atual", "ciclos"])

    if faltando:
        return jsonify({"erro": "Campos obrigatórios: " + ", ".join(faltando)}), 400

    try:
        bateria = cadastrar_bateria_no_banco(dados)
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    return jsonify({
        "mensagem": "Bateria cadastrada com sucesso",
        "bateria": bateria,
    }), 201


@app.route("/baterias", methods=["GET"])
def listar_baterias():
    return jsonify(listar_todas_baterias())


@app.route("/baterias/usuario/<int:usuario_id>", methods=["GET"])
def listar_baterias_usuario(usuario_id):
    return jsonify(listar_baterias_do_usuario(usuario_id))


criar_tabela_usuarios()
criar_tabela_baterias()

if __name__ == "__main__":
    app.run(debug=True)
