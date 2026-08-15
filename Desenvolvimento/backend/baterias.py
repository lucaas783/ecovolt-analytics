import sqlite3
from datetime import datetime


NOME_BANCO = "usuarios.db"
VIDA_UTIL_CICLOS = 1000


def conectar_banco():
    banco = sqlite3.connect(NOME_BANCO)
    banco.row_factory = sqlite3.Row
    return banco


def criar_tabela_baterias():
    banco = conectar_banco()
    cursor = banco.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS baterias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            fabricante TEXT,
            modelo TEXT,
            ano INTEGER,
            cap_original REAL,
            cap_atual REAL,
            ciclos REAL,
            soh REAL,
            status TEXT,
            classificacao TEXT,
            recomendacao TEXT,
            criado_em TEXT
        )
    """)

    banco.commit()
    banco.close()


def campos_faltando(dados, campos):
    faltando = []
    for campo in campos:
        if dados.get(campo) in (None, ""):
            faltando.append(campo)
    return faltando


def alerta_por_ciclos(ciclos):
    percentual = round((ciclos / VIDA_UTIL_CICLOS) * 100, 2)

    if percentual >= 100:
        nivel = "Crítico"
    elif percentual >= 80:
        nivel = "Atenção"
    else:
        nivel = "Normal"

    return {
        "nivel": nivel,
        "ciclos": ciclos,
        "vida_util": VIDA_UTIL_CICLOS,
        "percentual": percentual,
    }


def classificar_bateria(soh):
    if soh >= 80:
        return "Saudável", "Boa", "Bateria em bom estado. Continue acompanhando os ciclos e a capacidade."

    if soh >= 60:
        return "Atenção", "Regular", "Bateria com desgaste perceptível. Recomenda-se monitoramento mais frequente."

    return "Crítico", "Ruim", "Bateria com alto desgaste. Avalie manutenção, reaproveitamento adequado ou substituição."


def calcular_soh(dados):
    ano_atual = datetime.now().year
    ano = int(dados["ano"])
    cap_original = float(dados["cap_original"])
    cap_atual = float(dados["cap_atual"])
    ciclos = float(dados["ciclos"])

    if cap_original <= 0:
        raise ValueError("A capacidade original deve ser maior que zero")

    if cap_atual < 0 or ciclos < 0:
        raise ValueError("Capacidade atual e ciclos não podem ser negativos")

    soh = round((cap_atual / cap_original) * 100, 2)
    status, classificacao, recomendacao = classificar_bateria(soh)

    return {
        "fabricante": dados.get("fabricante", ""),
        "modelo": dados.get("modelo", ""),
        "ano": ano,
        "anos_uso": max(0, ano_atual - ano),
        "cap_original": cap_original,
        "cap_atual": cap_atual,
        "capacidade_perdida": round(cap_original - cap_atual, 2),
        "ciclos": ciclos,
        "soh": soh,
        "status": status,
        "classificacao": classificacao,
        "recomendacao": recomendacao,
        "alerta_ciclos": alerta_por_ciclos(ciclos),
    }


def usuario_existe(usuario_id):
    banco = conectar_banco()
    usuario = banco.execute("SELECT id FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
    banco.close()
    return usuario is not None


def cadastrar_bateria_no_banco(dados):
    usuario_id = int(dados["usuario_id"])

    if not usuario_existe(usuario_id):
        raise ValueError("Usuário não encontrado")

    resultado = calcular_soh(dados)
    criado_em = datetime.now().isoformat(timespec="seconds")

    banco = conectar_banco()
    cursor = banco.cursor()

    cursor.execute("""
        INSERT INTO baterias (
            usuario_id, fabricante, modelo, ano, cap_original, cap_atual,
            ciclos, soh, status, classificacao, recomendacao, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        usuario_id,
        resultado["fabricante"],
        resultado["modelo"],
        resultado["ano"],
        resultado["cap_original"],
        resultado["cap_atual"],
        resultado["ciclos"],
        resultado["soh"],
        resultado["status"],
        resultado["classificacao"],
        resultado["recomendacao"],
        criado_em,
    ))

    banco.commit()
    bateria_id = cursor.lastrowid
    banco.close()

    return {
        "id": bateria_id,
        "usuario_id": usuario_id,
        "criado_em": criado_em,
        **resultado,
    }


def transformar_bateria(bateria):
    return {
        "id": bateria["id"],
        "usuario_id": bateria["usuario_id"],
        "fabricante": bateria["fabricante"],
        "modelo": bateria["modelo"],
        "ano": bateria["ano"],
        "cap_original": bateria["cap_original"],
        "cap_atual": bateria["cap_atual"],
        "ciclos": bateria["ciclos"],
        "soh": bateria["soh"],
        "status": bateria["status"],
        "classificacao": bateria["classificacao"],
        "recomendacao": bateria["recomendacao"],
        "criado_em": bateria["criado_em"],
    }


def listar_todas_baterias():
    banco = conectar_banco()
    baterias = banco.execute("SELECT * FROM baterias ORDER BY id DESC").fetchall()
    banco.close()
    return [transformar_bateria(bateria) for bateria in baterias]


def listar_baterias_do_usuario(usuario_id):
    banco = conectar_banco()
    baterias = banco.execute(
        "SELECT * FROM baterias WHERE usuario_id = ? ORDER BY id DESC",
        (usuario_id,),
    ).fetchall()
    banco.close()
    return [transformar_bateria(bateria) for bateria in baterias]
