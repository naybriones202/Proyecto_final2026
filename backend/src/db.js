import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config'; // Aseguramos que cargue las variables si se llama por separado

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requiere SSL para conexiones externas. 
  // En Render (producción) es obligatorio. En local, depende de tu config.
  ssl: isProduction 
    ? { rejectUnauthorized: false } 
    : (process.env.DATABASE_URL.includes('supabase.com') ? { rejectUnauthorized: false } : false),
});

// Verificación de conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error adquiriendo el cliente:', err.stack);
  }
  console.log('✅ Conexión a PostgreSQL (Supabase) exitosa');
  release();
});

// Manejo de errores en clientes inactivos
pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el pool de la DB:', err);
});
