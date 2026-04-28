const API_URL = "https://devfinance-aywi.onrender.com/transactions";

let transacoes = [];
let editandoId = null;

const lista = document.getElementById("lista");
const botaoAdicionar = document.querySelector("button");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function carregarTransacoes() {
  const resposta = await fetch(API_URL);
  transacoes = await resposta.json();
  atualizarTela();
}

async function adicionar() {
  const descricao = document.getElementById("descricao").value;
  const valor = Number(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (descricao === "" || valor <= 0) {
    alert("Preencha descrição e valor corretamente.");
    return;
  }

  const transacao = {
    description: descricao,
    amount: valor,
    type: tipo,
    date: new Date().toLocaleDateString("pt-BR"),
  };

  if (editandoId !== null) {
    console.log("Editando ID:", editandoId);

    await fetch(`${API_URL}/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacao),
    });

    editandoId = null;
   document.getElementById("btnAdicionar").innerText = "ADICIONAR";
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacao),
    });
  }

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("tipo").value = "despesa";

  carregarTransacoes();
}

async function remover(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  carregarTransacoes();
}

function editar(id) {
  const transacao = transacoes.find((item) => item.id === id);

  document.getElementById("descricao").value = transacao.description;
  document.getElementById("valor").value = transacao.amount;
  document.getElementById("tipo").value = transacao.type;

  editandoId = id;
  document.getElementById("btnAdicionar").innerText = "SALVAR ALTERAÇÃO";
}

function atualizarTela() {
  lista.innerHTML = "";

  let receitas = 0;
  let despesas = 0;

  transacoes.forEach((transacao) => {
    const tr = document.createElement("tr");

    const descricao = transacao.description;
    const valor = Number(transacao.amount);
    const tipo = transacao.type;
    const data = transacao.date;

    tr.innerHTML = `
      <td>${descricao}</td>
      <td><span class="tag ${tipo}">${tipo}</span></td>
      <td class="${tipo}">${formatarMoeda(valor)}</td>
      <td>${data}</td>
      <td>
        <button class="editar" onclick="editar(${transacao.id})">EDITAR</button>
        <button class="remover" onclick="remover(${transacao.id})">EXCLUIR</button>
      </td>
    `;

    lista.appendChild(tr);

    if (tipo === "receita") {
      receitas += valor;
    } else {
      despesas += valor;
    }
  });

  document.getElementById("receitas").innerText = formatarMoeda(receitas);
  document.getElementById("despesas").innerText = formatarMoeda(despesas);
  document.getElementById("total").innerText = formatarMoeda(receitas - despesas);
}

carregarTransacoes();