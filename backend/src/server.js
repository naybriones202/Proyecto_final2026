import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const app = express();

// 🔹 __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS: Permitimos el acceso desde cualquier origen
app.use(cors({
  origin: '*', 
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

// ======================
// 🔹 SERVIR FRONTEND
// ======================
app.use(express.static(path.join(__dirname, 'dist'))); // cambiar 'dist' según tu build de Vite

// ======================
// 🔹 RUTAS API
// ======================

// Ruta de salud
app.get('/api', (req,res) => {
  res.json({ status: 'API Online 🚀', database: 'Conectada ✅' });
});

// AUTENTICACIÓN
app.post('/api/login', async (req,res) => {
  try {
    const { cedula, clave } = req.body;
    if (!cedula || !clave) return res.status(400).json({ msg: 'Cédula y clave requeridas' });

    const result = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula]);
    if (result.rows.length === 0) return res.status(401).json({ msg: 'Cédula no registrada' });

    const usuario = result.rows[0];
    const match = await bcrypt.compare(clave, usuario.clave);
    if (!match) return res.status(401).json({ msg: 'Contraseña incorrecta' });

    res.json({ usuario: { id: usuario.id, nombre: usuario.nombre, cedula: usuario.cedula } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// USUARIOS CRUD
app.get('/api/usuarios', async (req,res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/usuarios/:id', async (req,res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// MATERIAS
app.get('/api/materias', async (req,res) => {
  try {
    const result = await pool.query('SELECT * FROM materias ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ESTUDIANTES
app.get('/api/estudiantes', async (req,res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NOTAS
app.get('/api/notas', async (req,res) => {
  try {
    const sql = `
      SELECT n.id, e.nombre AS estudiante, m.nombre AS materia, n.nota
      FROM notas n
      JOIN estudiantes e ON n.estudiante_id = e.id
      JOIN materias m ON n.materia_id = m.id
      ORDER BY n.id ASC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ======================
// 🔹 CUALQUIER OTRA RUTA -> INDEX
// ======================
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname,'dist/index.html'));
});

// ======================
// 🚀 INICIO SERVIDOR
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
