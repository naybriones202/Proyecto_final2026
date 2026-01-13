import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

const app = express()

// ✅ CORS: Permitimos el acceso desde cualquier origen
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

// Ruta de salud para Render
app.get('/', (req, res) => {
  res.json({ status: 'API Online 🚀', database: 'Conectada ✅' })
})

// ==========================================
// 🔐 AUTENTICACIÓN
// ==========================================
app.post('/login', async (req, res) => {
  try {
    const { cedula, clave } = req.body
    if (!cedula || !clave) return res.status(400).json({ msg: 'Cédula y clave requeridas' })

    const result = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ msg: 'La cédula no está registrada' })
    }

    const usuario = result.rows[0]
    const match = await bcrypt.compare(clave, usuario.clave)
    
    if (!match) return res.status(401).json({ msg: 'Contraseña incorrecta' })

    res.json({ 
      usuario: { id: usuario.id, nombre: usuario.nombre, cedula: usuario.cedula },
      msg: 'Login exitoso'
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ==========================================
// 👥 USUARIOS
// ==========================================
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 📚 MATERIAS
// ==========================================
app.get('/materias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materias ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🎓 ESTUDIANTES
// ==========================================
app.get('/estudiantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 📝 NOTAS (Con JOIN para ver nombres)
// ==========================================
app.get('/notas', async (req, res) => {
  try {
    const sql = `
      SELECT n.id, e.nombre as estudiante, m.nombre as materia, n.nota 
      FROM notas n
      JOIN estudiantes e ON n.estudiante_id = e.id
      JOIN materias m ON n.materia_id = m.id
      ORDER BY n.id ASC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🚀 INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`)
})