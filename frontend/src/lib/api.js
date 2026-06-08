const API_BASE_URL = "http://127.0.0.1:5000";

async function enviarRequisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opcoes.headers || {}),
    },
    ...opcoes,
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao comunicar com o backend EcoVolt");
  }

  return dados;
}

export function cadastrarUsuario(dados) {
  return enviarRequisicao("/cadastro", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function loginUsuario(dados) {
  return enviarRequisicao("/login", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function calcularSoh(dados) {
  return enviarRequisicao("/simulador/soh", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function cadastrarBateria(dados) {
  return enviarRequisicao("/baterias", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarBateriasDoUsuario(usuarioId) {
  return enviarRequisicao(`/baterias/usuario/${usuarioId}`);
}

export { API_BASE_URL };

