const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const db = new sqlite3.Database("database.db");

const SECRET = "segredo_super_secreto";

app.use(cors());
app.use(express.json());

// ======================
// TABELAS
// ======================
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    description TEXT,
    amount REAL,
    type TEXT,
    date TEXT
  )
`);

// ======================
// REGISTER
// ======================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      res.json({ message: "Usuário criado" });
    }
  );
});

// ======================
// LOGIN
// ======================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ error: "Senha inválida" });
      }

      const token = jwt.sign({ id: user.id }, SECRET, {
        expiresIn: "1d"
      });

      res.json({ token });
    }
  );
});

// ======================
// MIDDLEWARE AUTH
// ======================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Sem token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// ======================
// GET TRANSAÇÕES
// ======================
app.get("/transactions", auth, (req, res) => {
  db.all(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC",
    [req.userId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// ======================
// POST
// ======================
app.post("/transactions", auth, (req, res) => {
  const { description, amount, type, date } = req.body;

  db.run(
    "INSERT INTO transactions (user_id, description, amount, type, date) VALUES (?, ?, ?, ?, ?)",
    [req.userId, description, amount, type, date],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// ======================
// DELETE
// ======================
app.delete("/transactions/:id", auth, (req, res) => {
  db.run("DELETE FROM transactions WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Deletado" });
  });
});

app.listen(3333, () => {
  console.log("Servidor rodando em http://localhost:3333");
});