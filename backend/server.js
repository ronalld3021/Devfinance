const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new Database("database.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL
  )
`).run();

app.get("/transactions", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM transactions ORDER BY id DESC")
    .all();

  res.json(rows);
});

app.post("/transactions", (req, res) => {
  const { description, amount, type, date } = req.body;

  if (!description || !amount || !type || !date) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  const result = db
    .prepare(
      "INSERT INTO transactions (description, amount, type, date) VALUES (?, ?, ?, ?)"
    )
    .run(description, amount, type, date);

  res.status(201).json({
    id: result.lastInsertRowid,
    description,
    amount,
    type,
    date,
  });
});

app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { description, amount, type, date } = req.body;

  if (!description || !amount || !type || !date) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  db.prepare(
    "UPDATE transactions SET description = ?, amount = ?, type = ?, date = ? WHERE id = ?"
  ).run(description, amount, type, date, id);

  res.json({ message: "Transação atualizada com sucesso" });
});

app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

  res.json({ message: "Transação excluída com sucesso" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});