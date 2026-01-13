import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

// URL del backend
const API = 'https://proyecto-final2026.onrender.com';
console.log("🔗 Conectando a:", API);

document.addEventListener("DOMContentLoaded", () => {

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');

    // ======================
    // LOGIN
    // ======================
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cedula = document.getElementById('login-cedula').value.trim();
            const clave = document.getElementById('login-clave').value.trim();

            if (!cedula || !clave) {
                Swal.fire('Error', 'Ingrese cédula y contraseña', 'warning');
                return;
            }

            try {
                const res = await fetch(`${API}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cedula, clave })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.msg || 'Usuario o contraseña incorrecta');

                Swal.fire({
                    icon: 'success',
                    title: 'Bienvenido',
                    text: data.usuario.nombre,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Guardar usuario en sesión (opcional)
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                // Cambiar interfaz
                if (loginSection) loginSection.classList.add('oculto');
                if (dashboardSection) dashboardSection.classList.remove('oculto');
                document.getElementById('usuario-logueado').innerText = data.usuario.nombre;

                // Cargar panel inicial
                mostrarPanel('usuarios');

            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        });
    }

    // ======================
    // LOGOUT
    // ======================
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('usuario');
            location.reload();
        });
    }

    // ======================
    // NAVEGACIÓN ENTRE PANELES
    // ======================
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

        // Cargar datos según sección
        if (panel === 'usuarios') cargarUsuarios();
        if (panel === 'materias') cargarMaterias();
        if (panel === 'estudiantes') cargarEstudiantes();
        if (panel === 'notas') cargarNotas();
    };

    // ======================
    // USUARIOS CRUD
    // ======================
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
                        <button class="btn btn-sm btn-danger" onclick="borrarUsuario(${u.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
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
                } else {
                    const data = await res.json();
                    Swal.fire('Error', data.error || 'No se pudo eliminar', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
            }
        }
    };

    // ======================
    // MATERIAS CRUD
    // ======================
    window.cargarMaterias = async () => {
        try {
            const res = await fetch(`${API}/materias`);
            const materias = await res.json();
            const tabla = document.getElementById('tabla-materias-body');
            if (!tabla) return;

            tabla.innerHTML = materias.map(m => `
                <tr>
                    <td>#${m.id}</td>
                    <td>${m.codigo}</td>
                    <td>${m.nombre}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Error al cargar materias:", err);
        }
    };

    // ======================
    // ESTUDIANTES CRUD
    // ======================
    window.cargarEstudiantes = async () => {
        try {
            const res = await fetch(`${API}/estudiantes`);
            const estudiantes = await res.json();
            const tabla = document.getElementById('tabla-estudiantes-body');
            if (!tabla) return;

            tabla.innerHTML = estudiantes.map(e => `
                <tr>
                    <td>#${e.id}</td>
                    <td>${e.cedula}</td>
                    <td>${e.nombre}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Error al cargar estudiantes:", err);
        }
    };

    // ======================
    // NOTAS
    // ======================
    window.cargarNotas = async () => {
        try {
            const res = await fetch(`${API}/notas`);
            const notas = await res.json();
            const tabla = document.getElementById('tabla-notas-body');
            if (!tabla) return;

            tabla.innerHTML = notas.map(n => `
                <tr>
                    <td>#${n.id}</td>
                    <td>${n.estudiante}</td>
                    <td>${n.materia}</td>
                    <td>${n.nota}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Error al cargar notas:", err);
        }
    };

});
