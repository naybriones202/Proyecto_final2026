import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

// Cambia la línea 10 de tu main.js por esto solo para probar:
// Reemplaza las líneas 7-12 por esto:
const API = 'https://proyecto-final2026.onrender.com';
console.log("🔗 Conectando a:", API);

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
                if (!res.ok) throw new Error(data.msg || 'Error en login');

                Swal.fire({ icon: 'success', title: 'Bienvenido', text: data.usuario.nombre, timer: 1500, showConfirmButton: false });

                document.getElementById('usuario-logueado').innerText = data.usuario.nombre;
                loginSection.classList.replace('d-flex', 'oculto');
                dashboardSection.classList.remove('oculto');
                mostrarPanel('usuarios');

            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        });
    }

    // === NAVEGACIÓN GLOBAL ===
    window.mostrarPanel = (panel) => {
        ['usuarios', 'materias', 'estudiantes', 'notas'].forEach(p => {
            document.getElementById(`panel-${p}`)?.classList.add('oculto');
        });
        document.getElementById(`panel-${panel}`)?.classList.remove('oculto');
        
        const titulos = { usuarios: 'Usuarios', materias: 'Materias', estudiantes: 'Estudiantes', notas: 'Notas' };
        document.getElementById('titulo-seccion').innerText = titulos[panel];

        if (panel === 'usuarios') cargarUsuarios();
    };

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
                    <td><button class="btn btn-sm btn-danger" onclick="borrarUsuario('${u.id}')">🗑</button></td>
                </tr>`).join('');
        } catch (err) { console.error(err); }
    };
});