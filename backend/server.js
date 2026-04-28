const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

app.get("/transactions", (req, res) => {
  db.all("SELECT * FROM transactions ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao buscar transações" });
    }

    res.json(rows);
  });
});

app.post("/transactions", (req, res) => {
  const { description, amount, type, date } = req.body;

  if (!description || !amount || !type) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  db.run(
    "INSERT INTO transactions (description, amount, type, date) VALUES (?, ?, ?, ?)",
    [description, amount, type, date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao cadastrar transação" });
      }

      res.status(201).json({
        id: this.lastID,
        description,
        amount,
        type,
        date,
      });
    }
  );
});

app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM transactions WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Erro ao excluir transação" });
    }

    res.json({ message: "Transação excluída com sucesso" });
  });
});
app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { description, amount, type, date } = req.body;

  if (!description || !amount || !type || !date) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  db.run(
    `
    UPDATE transactions
    SET description = ?, amount = ?, type = ?, date = ?
    WHERE id = ?
    `,
    [description, amount, type, date, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao atualizar transação" });
      }

      res.json({ message: "Transação atualizada com sucesso" });
    }
  );
});
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});