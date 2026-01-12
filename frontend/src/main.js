// 1. IMPORTACIONES (Vite las empaqueta localmente para evitar bloqueos)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

// 2. CONFIGURACIÓN DE API
// Vite carga las variables desde el archivo .env o el Dashboard de Render
const API = import.meta.env.VITE_API_URL;

// Validación inmediata
if (!API) {
    console.error("❌ Error: VITE_API_URL no está definida en el entorno.");
} else {
    console.log("✅ API conectada:", API);
}

// 3. LÓGICA PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');

    // === LOGIN ===
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cedula = document.getElementById('login-cedula').value;
            const clave = document.getElementById('login-clave').value;

            try {
                const res = await fetch(`${API}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cedula, clave })
                });

                const data = await res.json();

                if (!res.ok) {
                    Swal.fire('Error', data.msg || 'Credenciales incorrectas', 'error');
                    return;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Bienvenido',
                    text: data.usuario.nombre,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Actualizar interfaz
                const userSpan = document.getElementById('usuario-logueado');
                if (userSpan) userSpan.innerText = data.usuario.nombre;

                loginSection.classList.add('oculto');
                loginSection.classList.remove('d-flex');
                dashboardSection.classList.remove('oculto');

                // Cargar datos iniciales
                mostrarPanel('usuarios');
            } catch (error) {
                console.error("Error en login:", error);
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }

    // === LOGOUT ===
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => location.reload());
    }

    // === NAVEGACIÓN (Definidas en el scope de window para los onclick del HTML) ===
    window.mostrarPanel = (panel) => {
        const paneles = ['usuarios', 'materias', 'estudiantes', 'notas'];
        paneles.forEach(p => {
            const el = document.getElementById(`panel-${p}`);
            if (el) el.classList.add('oculto');
        });

        const activo = document.getElementById(`panel-${panel}`);
        if (activo) activo.classList.remove('oculto');

        const titulos = {
            usuarios: 'Gestión de Usuarios',
            materias: 'Gestión de Materias',
            estudiantes: 'Directorio de Estudiantes',
            notas: 'Registro de Calificaciones'
        };

        const titulo = document.getElementById('titulo-seccion');
        if (titulo) titulo.innerText = titulos[panel] || 'Panel';

        // Ejecutar carga según panel
        if (panel === 'usuarios') cargarUsuarios();
        if (panel === 'materias') cargarMaterias();
        if (panel === 'estudiantes') cargarEstudiantes();
        if (panel === 'notas') cargarNotas();
    };

    // === FUNCIONES DE CARGA ===
    window.cargarUsuarios = async () => {
        try {
            const res = await fetch(`${API}/usuarios`);
            const usuarios = await res.json();
            const tabla = document.getElementById('tabla-usuarios-body');
            if (!tabla) return;

            tabla.innerHTML = '';
            usuarios.forEach(u => {
                tabla.innerHTML += `
                    <tr>
                        <td>#${u.id}</td>
                        <td>${u.cedula}</td>
                        <td>${u.nombre}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="borrarUsuario('${u.id}')">🗑</button>
                        </td>
                    </tr>`;
            });
        } catch (err) { console.error("Error cargando usuarios", err); }
    };

    window.borrarUsuario = async (id) => {
        if (confirm('¿Eliminar usuario?')) {
            await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
            cargarUsuarios();
        }
    };

    // ... (Puedes seguir el mismo patrón para materias, estudiantes y notas)
});