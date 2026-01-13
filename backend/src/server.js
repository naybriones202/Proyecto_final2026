import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

const app = express()

// ==========================================
// ✅ CORS CORRECTO (FRONTEND LOCAL + VERCEL)
// ==========================================
app.use(cors({
  origin: [
    'http://localhost:5173', // Para pruebas locales
    'https://proyecto-final2026.vercel.app', // Tu frontend en producción
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json())

// ==========================================
// ✅ RUTA BASE (OBLIGATORIA PARA RENDER)
// ==========================================
app.get('/', (req, res) => {
  res.json({ status: 'API funcionando correctamente 🚀' })
})

// ==========================================
// TEST CONEXIÓN SUPABASE
// ==========================================
pool.query('SELECT 1')
  .then(() => console.log('✅ Conectado a Supabase'))
  .catch(err => console.error('❌ Error Supabase:', err))

// ==========================================
// USUARIOS
// ==========================================
app.post('/usuarios', async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body
    if (!cedula || !nombre || !clave) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' })
    }

    const hash = await bcrypt.hash(clave, 10)

    const result = await pool.query(
      'INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1,$2,$3) RETURNING *',
      [cedula, nombre, hash]
    )

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ msg: 'Cédula ya registrada' })
    }
    res.status(500).json({ error: error.message })
  }
})

app.get('/usuarios', async (_, res) => {
  const result = await pool.query('SELECT * FROM usuarios ORDER BY id ASC')
  res.json(result.rows)
})

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { cedula, nombre, clave } = req.body

    const hash = await bcrypt.hash(clave, 10)

    const result = await pool.query(
      'UPDATE usuarios SET cedula=$1, nombre=$2, clave=$3 WHERE id=$4 RETURNING *',
      [cedula, nombre, hash, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/usuarios/:id', async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id=$1', [req.params.id])
  res.json({ msg: 'Usuario eliminado' })
})

// ==========================================
// LOGIN
// ==========================================
app.post('/login', async (req, res) => {
  const { cedula, clave } = req.body

  const result = await pool.query(
    'SELECT * FROM usuarios WHERE cedula=$1',
    [cedula]
  )

  if (result.rows.length === 0) {
    return res.status(401).json({ msg: 'Usuario no encontrado' })
  }

  const usuario = result.rows[0]
  const ok = await bcrypt.compare(clave, usuario.clave)

  if (!ok) {
    return res.status(401).json({ msg: 'Contraseña incorrecta' })
  }

  res.json({
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      cedula: usuario.cedula
    }
  })
})

// ==========================================
// MATERIAS, ESTUDIANTES, NOTAS
// (tu código aquí está BIEN, no se toca)
// ==========================================

// ==========================================
// PUERTO
// ==========================================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`)
})
