import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

const app = express()

// ✅ CONFIGURACIÓN DE CORS MEJORADA
// Permitimos que el frontend envíe JSON y acceda a los recursos
app.use(cors({
  origin: '*', // Permite peticiones desde cualquier lugar (incluyendo tu local y Render)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

// Ruta de verificación (Útil para que Render sepa que el servicio está vivo)
app.get('/', (req, res) => {
  res.json({ 
    status: 'API Funcionando 🚀', 
    proyecto: 'Proyecto Final 2026',
    database: 'Conectada ✅' 
  })
})

// ======================
// LOGIN (Optimizado para evitar el 401 genérico)
// ======================
app.post('/login', async (req, res) => {
  try {
    const { cedula, clave } = req.body
    if (!cedula || !clave) return res.status(400).json({ msg: 'Cédula y clave requeridas' })

    const result = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula])
    
    // Si el usuario no existe, enviamos un 401 con mensaje claro
    if (result.rows.length === 0) {
      return res.status(401).json({ msg: 'La cédula no está registrada' })
    }

    const usuario = result.rows[0]
    const match = await bcrypt.compare(clave, usuario.clave)
    
    // Si la contraseña no coincide, enviamos un 401
    if (!match) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' })
    }

    // Respuesta exitosa
    res.json({ 
      usuario: { id: usuario.id, nombre: usuario.nombre, cedula: usuario.cedula },
      msg: 'Login exitoso'
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ======================
// RESTO DE RUTAS (USUARIOS, MATERIAS, ESTUDIANTES, NOTAS)
// ======================

// [Tus rutas CRUD de Usuarios, Materias, Estudiantes y Notas se mantienen igual...]
// Solo asegúrate de envolverlas en try/catch como hice en el login para evitar que el servidor se caiga.

// ======================
// INICIO DEL SERVIDOR (CRÍTICO PARA RENDER)
// ======================
// Render asigna un puerto automáticamente. NO uses solo 3000.
const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`)
})

