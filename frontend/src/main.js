document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // CONFIGURACIÓN GLOBAL
  // ==============================
  import.meta.env

  const API = import.meta.env.VITE_API_URL;

  if (!API) {
    console.error("❌ VITE_API_URL no está definida");
    return;
  }

  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  // ==============================
  // LOGIN
  // ==============================
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
          timer: 1000,
          showConfirmButton: false
        });

        const userSpan = document.getElementById('usuario-logueado');
        if (userSpan) userSpan.innerText = data.usuario.nombre;

        loginSection.classList.add('oculto');
        loginSection.classList.remove('d-flex');
        dashboardSection.classList.remove('oculto');

        mostrarPanel('usuarios');
        cargarUsuarios();
        cargarMaterias();
        cargarEstudiantes();
        cargarNotas();

      } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
      }
    });
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => location.reload());
  }

  // ==============================
  // NAVEGACIÓN
  // ==============================
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

    if (panel === 'usuarios') cargarUsuarios();
    if (panel === 'materias') cargarMaterias();
    if (panel === 'estudiantes') cargarEstudiantes();
    if (panel === 'notas') cargarNotas();
  };

  // ==============================
  // USUARIOS
  // ==============================
  window.cargarUsuarios = async () => {
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
            <button onclick="borrarUsuario('${u.id}')">🗑</button>
          </td>
        </tr>
      `;
    });
  };

  window.borrarUsuario = async (id) => {
    if (confirm('¿Eliminar usuario?')) {
      await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
      cargarUsuarios();
    }
  };

  // ==============================
  // MATERIAS
  // ==============================
  window.cargarMaterias = async () => {
    const res = await fetch(`${API}/materias`);
    const materias = await res.json();

    const tabla = document.getElementById('tabla-materias-body');
    if (!tabla) return;

    tabla.innerHTML = '';
    materias.forEach(m => {
      tabla.innerHTML += `
        <tr>
          <td>${m.codigo}</td>
          <td>${m.nombre}</td>
          <td>
            <button onclick="borrarMateria('${m.id}')">🗑</button>
          </td>
        </tr>
      `;
    });
  };

  window.borrarMateria = async (id) => {
    if (confirm('¿Eliminar materia?')) {
      await fetch(`${API}/materias/${id}`, { method: 'DELETE' });
      cargarMaterias();
    }
  };

  // ==============================
  // ESTUDIANTES
  // ==============================
  window.cargarEstudiantes = async () => {
    const res = await fetch(`${API}/estudiantes`);
    const estudiantes = await res.json();

    const tabla = document.getElementById('tabla-estudiantes-body');
    if (!tabla) return;

    tabla.innerHTML = '';
    estudiantes.forEach(e => {
      tabla.innerHTML += `
        <tr>
          <td>${e.cedula}</td>
          <td>${e.nombre}</td>
          <td>
            <button onclick="borrarEstudiante('${e.id}')">🗑</button>
          </td>
        </tr>
      `;
    });
  };

  window.borrarEstudiante = async (id) => {
    if (confirm('¿Eliminar estudiante?')) {
      await fetch(`${API}/estudiantes/${id}`, { method: 'DELETE' });
      cargarEstudiantes();
    }
  };

  // ==============================
  // NOTAS
  // ==============================
  window.cargarNotas = async () => {
    const res = await fetch(`${API}/notas`);
    const notas = await res.json();

    const tabla = document.getElementById('tabla-notas-body');
    if (!tabla || !Array.isArray(notas)) return;

    tabla.innerHTML = '';
    notas.forEach(n => {
      tabla.innerHTML += `
        <tr>
          <td>${n.estudiante}</td>
          <td>${n.materia}</td>
          <td>${n.nota}</td>
          <td>
            <button onclick="borrarNota('${n.id}')">🗑</button>
          </td>
        </tr>
      `;
    });
  };

  window.borrarNota = async (id) => {
    if (confirm('¿Eliminar nota?')) {
      await fetch(`${API}/notas/${id}`, { method: 'DELETE' });
      cargarNotas();
    }
  };

});
