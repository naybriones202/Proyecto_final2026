import bcrypt from 'bcryptjs';
import { pool } from '../db.js'; // Ajusta la ruta según tu estructura de carpetas

async function crearUsuarios() {
  const usuarios = [
    { cedula: '1712345678', nombre: 'Admin', clave: '1234' },
    { cedula: '1723456789', nombre: 'Juan', clave: 'abcd' },
    { cedula: '1734567890', nombre: 'Maria', clave: 'qwerty' },
    { cedula: '1745678901', nombre: 'Pedro', clave: 'pass123' },
    { cedula: '1756789012', nombre: 'Ana', clave: 'secret' }
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.clave, 10);
    await pool.query(
      'INSERT INTO usuarios (cedula, nombre, clave) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [u.cedula, u.nombre, hash]
    );
  }

  console.log('✅ Usuarios inicializados');
  process.exit(0);
}

crearUsuarios();
