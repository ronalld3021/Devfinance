let lista = document.getElementById("lista");

let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

window.onload = function () {
  atualizarTela();
};

function adicionar() {
  let descricao = document.getElementById("descricao").value;
  let valor = Number(document.getElementById("valor").value);
  let tipo = document.getElementById("tipo").value;

  if (descricao === "" || valor <= 0) return;

  let transacao = {
    id: Date.now(),
    descricao,
    valor,
    tipo,
    data: new Date().toLocaleDateString("pt-BR")
  };

  transacoes.push(transacao);
  salvar();
  atualizarTela();

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
}

function remover(id) {
  transacoes = transacoes.filter(transacao => transacao.id !== id);
  salvar();
  atualizarTela();
}

function salvar() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function atualizarTela() {
  lista.innerHTML = "";

  let receitas = 0;
  let despesas = 0;

  transacoes.forEach(transacao => {
    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${transacao.descricao}</td>
      <td><span class="tag ${transacao.tipo}">${transacao.tipo}</span></td>
      <td class="${transacao.tipo}">R$ ${transacao.valor.toFixed(2)}</td>
      <td>${transacao.data || "-"}</td>
      <td>
        <button class="remover" onclick="remover(${transacao.id})">Excluir</button>
      </td>
    `;

    lista.appendChild(tr);

    if (transacao.tipo === "receita") {
      receitas += transacao.valor;
    } else {
      despesas += transacao.valor;
    }
  });

  document.getElementById("receitas").innerText = `R$ ${receitas.toFixed(2)}`;
  document.getElementById("despesas").innerText = `R$ ${despesas.toFixed(2)}`;
  document.getElementById("total").innerText = `R$ ${(receitas - despesas).toFixed(2)}`;
}