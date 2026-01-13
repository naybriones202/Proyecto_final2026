import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config'; // ✅ Esto debe estar arriba de todo

const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL || ""; // ✅ Evita que sea undefined

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction 
    ? { rejectUnauthorized: false } 
    : (dbUrl.includes('supabase.com') ? { rejectUnauthorized: false } : false),
});

// Verificación de conexión
if (!dbUrl) {
  console.error('❌ ERROR: La variable DATABASE_URL no está definida en el archivo .env');
} else {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('❌ Error de conexión a la DB:', err.stack);
    }
    console.log('✅ Conexión a PostgreSQL exitosa');
    release();
  });
}

pool.on('error', (err) => {
  console.error('⚠️ Error en el pool:', err);
});
