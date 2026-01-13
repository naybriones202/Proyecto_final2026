import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

// URL del backend en Render
const API = 'https://proyecto-final2026.onrender.com';
console.log("🔗 Conectando a:", API);

document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');

    // === LÓGICA DE LOGIN ===
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
                if (!res.ok) throw new Error(data.msg || 'Error en login');

                Swal.fire({ 
                    icon: 'success', 
                    title: 'Bienvenido', 
                    text: data.usuario.nombre, 
                    timer: 1500, 
                    showConfirmButton: false 
                });

                // Actualizar Interfaz
                document.getElementById('usuario-logueado').innerText = data.usuario.nombre;
                loginSection.classList.replace('d-flex', 'oculto');
                dashboardSection.classList.remove('oculto');
                
                // Cargar panel inicial
                window.mostrarPanel('usuarios');

            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        });
    }

    // === BOTÓN CERRAR SESIÓN ===
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => location.reload());
    }

    // === NAVEGACIÓN GLOBAL ===
    window.mostrarPanel = (panel) => {
        const secciones = ['usuarios', 'materias', 'estudiantes', 'notas'];
        secciones.forEach(p => {
            const el = document.getElementById(`panel-${p}`);
            if (el) el.classList.add('oculto');
        });

        const panelActivo = document.getElementById(`panel-${panel}`);
        if (panelActivo) panelActivo.classList.remove('oculto');
        
        const titulos = { 
            usuarios: 'Gestión de Usuarios', 
            materias: 'Gestión de Materias', 
            estudiantes: 'Directorio de Estudiantes', 
            notas: 'Registro de Notas' 
        };
        document.getElementById('titulo-seccion').innerText = titulos[panel] || 'Panel';

        // Carga de datos según la sección
        if (panel === 'usuarios') cargarUsuarios();
    };

    // === CRUD DE USUARIOS ===
    window.cargarUsuarios = async () => {
        try {
            const res = await fetch(`${API}/usuarios`);
            const usuarios = await res.json();
            const tabla = document.getElementById('tabla-usuarios-body');
            if (!tabla) return;

            tabla.innerHTML = usuarios.map(u => `
                <tr>
                    <td>#${u.id}</td>
                    <td>${u.cedula}</td>
                    <td>${u.nombre}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="borrarUsuario('${u.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`).join('');
        } catch (err) { 
            console.error("Error al cargar usuarios:", err); 
        }
    };

    window.borrarUsuario = async (id) => {
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            try {
                const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Eliminado', 'El usuario ha sido borrado', 'success');
                    cargarUsuarios();
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
            }
        }
    };
});