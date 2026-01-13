import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

// ✅ Configuración simplificada y altamente compatible con Render/Supabase
export const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl && dbUrl.includes('supabase.com') 
    ? { rejectUnauthorized: false } 
    : false
});

// Verificación de conexión
if (!dbUrl) {
  console.error('❌ ERROR: DATABASE_URL no encontrada en las variables de entorno.');
} else {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('❌ Error de conexión a la DB:', err.stack);
    }
    console.log('✅ Conexión a PostgreSQL (Supabase) exitosa');
    release();
  });
}

pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el pool de clientes:', err);
});