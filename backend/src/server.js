import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

const app = express()

// ✅ Configuración de CORS para evitar bloqueos
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

// ✅ Ruta de verificación para Render
app.get('/', (req, res) => {
  res.json({ status: 'API Funcionando 🚀', proyecto: 'Proyecto Final 2026' })
})

// ==========================================
// 🔐 SECCIÓN: USUARIOS Y LOGIN
// ==========================================

app.post('/login', async (req, res) => {
  try {
    const { cedula, clave } = req.body
    const result = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula])

    if (result.rows.length === 0) return res.status(401).json({ msg: 'Usuario no encontrado' })

    const usuario = result.rows[0]
    const match = await bcrypt.compare(clave, usuario.clave)

    if (!match) return res.status(401).json({ msg: 'Contraseña incorrecta' })

    res.json({ usuario: { id: usuario.id, nombre: usuario.nombre, cedula: usuario.cedula } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/usuarios', async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body
    const hash = await bcrypt.hash(clave, 10)
    const result = await pool.query(
      'INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1, $2, $3) RETURNING id, cedula, nombre',
      [cedula, nombre, hash]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/usuarios', async (req, res) => {
  const result = await pool.query('SELECT id, cedula, nombre FROM usuarios ORDER BY id ASC')
  res.json(result.rows)
})

app.delete('/usuarios/:id', async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id])
  res.json({ msg: 'Usuario eliminado' })
})

// ==========================================
// 📚 SECCIÓN: MATERIAS
// ==========================================

app.get('/materias', async (req, res) => {
  const result = await pool.query('SELECT * FROM materias ORDER BY nombre ASC')
  res.json(result.rows)
})

app.post('/materias', async (req, res) => {
  const { nombre, descripcion } = req.body
  const result = await pool.query(
    'INSERT INTO materias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
    [nombre, descripcion]
  )
  res.json(result.rows[0])
})

// ==========================================
// 🎓 SECCIÓN: ESTUDIANTES
// ==========================================

app.get('/estudiantes', async (req, res) => {
  const result = await pool.query('SELECT * FROM estudiantes ORDER BY apellido ASC')
  res.json(result.rows)
})

app.post('/estudiantes', async (req, res) => {
  const { cedula, nombre, apellido, correo } = req.body
  const result = await pool.query(
    'INSERT INTO estudiantes (cedula, nombre, apellido, correo) VALUES ($1, $2, $3, $4) RETURNING *',
    [cedula, nombre, apellido, correo]
  )
  res.json(result.rows[0])
})

// ==========================================
// 📝 SECCIÓN: NOTAS (Relacional)
// ==========================================

app.get('/notas', async (req, res) => {
  const query = `
    SELECT n.id, e.nombre as estudiante, m.nombre as materia, n.nota
    FROM notas n
    JOIN estudiantes e ON n.estudiante_id = e.id
    JOIN materias m ON n.materia_id = m.id
  `
  const result = await pool.query(query)
  res.json(result.rows)
})

// ==========================================
// 🚀 INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
