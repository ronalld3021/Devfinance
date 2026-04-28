const API_URL = "https://devfinance-aywi.onrender.com/transactions";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

let transacoes = [];
let grafico;

async function carregarTransacoes() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: token
    }
  });

  if (res.status === 401) {
    logout();
    return;
  }

  transacoes = await res.json();
  atualizarTela();
}

window.adicionar = async function () {
  const descricaoInput = document.getElementById("descricao");
  const valorInput = document.getElementById("valor");
  const tipoInput = document.getElementById("tipo");

  const descricao = descricaoInput.value.trim();
  const valor = valorInput.value;
  const tipo = tipoInput.value;

  if (!descricao || !valor || Number(valor) <= 0) {
    alert("Preencha descrição e valor corretamente");
    return;
  }

  const data = new Date().toLocaleDateString("pt-BR");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      description: descricao,
      amount: Number(valor),
      type: tipo,
      date: data
    })
  });

  if (!res.ok) {
    alert("Erro ao adicionar transação");
    return;
  }

  limparCampos();
  carregarTransacoes();
};

window.editar = async function (id) {
  const t = transacoes.find((item) => item.id === id);

  if (!t) return;

  document.getElementById("descricao").value = t.description;
  document.getElementById("valor").value = t.amount;
  document.getElementById("tipo").value = t.type;

  await remover(id);
};

window.remover = async function (id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  });

  carregarTransacoes();
};

window.logout = function () {
  localStorage.removeItem("token");
  window.location.href = "login.html";
};

function atualizarTela() {
  const lista = document.getElementById("lista");
  const receitas = document.getElementById("receitas");
  const despesas = document.getElementById("despesas");
  const total = document.getElementById("total");

  lista.innerHTML = "";

  let totalReceitas = 0;
  let totalDespesas = 0;

  transacoes.forEach((t) => {
    const valor = Number(t.amount);

    if (t.type === "receita") {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.description}</td>
      <td><span class="tag ${t.type}">${t.type}</span></td>
      <td>${formatarMoeda(valor)}</td>
      <td>${t.date}</td>
      <td>
        <button onclick="editar(${t.id})">EDITAR</button>
        <button onclick="remover(${t.id})">EXCLUIR</button>
      </td>
    `;

    lista.appendChild(tr);
  });

  receitas.innerText = formatarMoeda(totalReceitas);
  despesas.innerText = formatarMoeda(totalDespesas);
  total.innerText = formatarMoeda(totalReceitas - totalDespesas);

  atualizarGrafico(totalReceitas, totalDespesas);
}

function atualizarGrafico(receitas, despesas) {
  const canvas = document.getElementById("grafico");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [
        {
          data: [receitas, despesas],
          backgroundColor: ["#22c55e", "#ef4444"]
        }
      ]
    }
  });
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function limparCampos() {
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("tipo").value = "receita";
}

carregarTransacoes();