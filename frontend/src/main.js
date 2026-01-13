import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

const API = 'https://proyecto-final2026.onrender.com';
console.log("🔗 Conectando a:", API);

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  // ✅ PERSISTENCIA DE SESIÓN
  // Si ya hay un usuario en localStorage, saltamos el login
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const user = JSON.parse(usuarioGuardado);
    loginSection.classList.add('oculto');
    dashboardSection.classList.remove('oculto');
    document.getElementById('usuario-logueado').innerText = user.nombre;
    mostrarPanel('usuarios');
  }

  // LOGIN
  const formLogin = document.getElementById('form-login');
  formLogin?.addEventListener('submit', async e => {
    e.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const clave = document.getElementById('login-clave').value.trim();
    
    if (!cedula || !clave) return Swal.fire('Error', 'Ingrese cédula y contraseña', 'warning');

    // Mostrar indicador de carga (útil para el despertar lento de Render)
    Swal.fire({ title: 'Verificando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, clave })
      });
      
      const data = await res.json();

      if (!res.ok) {
        // Si el servidor responde 401, el error viene aquí
        throw new Error(data.msg || 'Credenciales incorrectas');
      }

      Swal.fire({ icon: 'success', title: 'Bienvenido', text: data.usuario.nombre, timer: 1500, showConfirmButton: false });
      
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      loginSection.classList.add('oculto');
      dashboardSection.classList.remove('oculto');
      document.getElementById('usuario-logueado').innerText = data.usuario.nombre;
      mostrarPanel('usuarios');

    } catch (error) {
      // ✅ Aquí capturamos el 401 y lo mostramos bonito
      Swal.fire('Error de Autenticación', error.message, 'error');
    }
  });

  // LOGOUT
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    location.reload();
  });

  // PANEL
  window.mostrarPanel = panel => {
    const secciones = ['usuarios','materias','estudiantes','notas'];
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
    
    const tituloDoc = document.getElementById('titulo-seccion');
    if (tituloDoc) tituloDoc.innerText = titulos[panel] || 'Panel';

    if(panel==='usuarios') cargarUsuarios();
    if(panel==='materias') cargarMaterias();
    if(panel==='estudiantes') cargarEstudiantes();
    if(panel==='notas') cargarNotas();
  }

  // --- CRUD FUNCTIONS ---
  
  window.cargarUsuarios = async () => {
    const tabla = document.getElementById('tabla-usuarios-body');
    if (!tabla) return;
    try {
      const res = await fetch(`${API}/usuarios`);
      if (res.status === 401) return manejarSesionExpirada();
      const usuarios = await res.json();
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
        </tr>`).join('');
    } catch (err) { console.error("Error cargando usuarios:", err); }
  }

  // ✅ Función extra para manejar errores de autorización globales
  function manejarSesionExpirada() {
    localStorage.removeItem('usuario');
    Swal.fire('Sesión Expirada', 'Por favor inicia sesión de nuevo', 'info')
      .then(() => location.reload());
  }

  // ... (El resto de tus funciones cargarMaterias, cargarEstudiantes, etc. se mantienen igual)
});
