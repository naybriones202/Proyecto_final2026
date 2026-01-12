// ==============================
// CONFIGURACIÓN GLOBAL
// ==============================
const API = import.meta.env.VITE_API_URL;

// Secciones principales
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');

// ==============================
// LOGIN
// ==============================
document.getElementById('form-login').addEventListener('submit', async (e) => {
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

    document.getElementById('usuario-logueado').innerText = data.usuario.nombre;

    loginSection.classList.add('oculto');
    loginSection.classList.remove('d-flex');
    dashboardSection.classList.remove('oculto');
    dashboardSection.classList.add('d-flex');

    mostrarPanel('usuarios');
    cargarUsuarios();
    cargarMaterias();
    cargarEstudiantes();
    cargarNotas();

  } catch (error) {
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => location.reload());

// ==============================
// NAVEGACIÓN
// ==============================
window.mostrarPanel = (panel) => {
  const paneles = ['usuarios', 'materias', 'estudiantes', 'notas'];

  paneles.forEach(p => {
    document.getElementById(`panel-${p}`).classList.add('oculto');

    const btn = document.getElementById(`btn-nav-${p}`);
    if (btn) {
      btn.classList.remove('active', 'text-white');
      btn.classList.add('text-white-50');
    }
  });

  document.getElementById(`panel-${panel}`).classList.remove('oculto');

  const btnActivo = document.getElementById(`btn-nav-${panel}`);
  if (btnActivo) {
    btnActivo.classList.add('active', 'text-white');
    btnActivo.classList.remove('text-white-50');
  }

  const titulos = {
    usuarios: 'Gestión de Usuarios',
    materias: 'Gestión de Materias',
    estudiantes: 'Directorio de Estudiantes',
    notas: 'Registro de Calificaciones'
  };

  document.getElementById('titulo-seccion').innerText = titulos[panel] || 'Panel';

  if (panel === 'estudiantes') cargarEstudiantes();
  if (panel === 'notas') {
    cargarEstudiantes();
    cargarMaterias();
    cargarNotas();
  }
};

// ==============================
// USUARIOS
// ==============================
async function cargarUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  const usuarios = await res.json();

  const tabla = document.getElementById('tabla-usuarios-body');
  tabla.innerHTML = '';

  usuarios.forEach(u => {
    tabla.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">#${u.id}</td>
        <td>${u.cedula}</td>
        <td>${u.nombre}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-primary"
            onclick="editarUsuario('${u.id}','${u.cedula}','${u.nombre}','${u.clave}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger"
            onclick="borrarUsuario('${u.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

document.getElementById('form-usuario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('user-id').value;

  const body = {
    cedula: document.getElementById('user-cedula').value,
    nombre: document.getElementById('user-nombre').value,
    clave: document.getElementById('user-clave').value
  };

  const url = id ? `${API}/usuarios/${id}` : `${API}/usuarios`;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  Swal.fire('Listo', 'Usuario guardado', 'success');
  limpiarFormUsuario();
  cargarUsuarios();
});

window.editarUsuario = (id, cedula, nombre, clave) => {
  document.getElementById('user-id').value = id;
  document.getElementById('user-cedula').value = cedula;
  document.getElementById('user-nombre').value = nombre;
  document.getElementById('user-clave').value = clave;
  document.getElementById('titulo-form-usuario').innerText = `Editar Usuario #${id}`;
};

window.borrarUsuario = async (id) => {
  if (confirm('¿Eliminar usuario?')) {
    await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
    cargarUsuarios();
  }
};

window.limpiarFormUsuario = () => {
  document.getElementById('form-usuario').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('titulo-form-usuario').innerText = 'Nuevo Usuario';
};

// ==============================
// MATERIAS
// ==============================
async function cargarMaterias() {
  const res = await fetch(`${API}/materias`);
  const materias = await res.json();

  const tabla = document.getElementById('tabla-materias-body');
  const select = document.getElementById('nota-materia');

  tabla.innerHTML = '';
  select.innerHTML = '<option value="">Seleccione Materia...</option>';

  materias.forEach(m => {
    tabla.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">#${m.id}</td>
        <td>${m.codigo}</td>
        <td>${m.nombre}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger"
            onclick="borrarMateria('${m.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
    select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
  });
}

document.getElementById('form-materia').addEventListener('submit', async (e) => {
  e.preventDefault();

  await fetch(`${API}/materias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codigo: document.getElementById('materia-codigo').value,
      nombre: document.getElementById('materia-nombre').value
    })
  });

  Swal.fire('Listo', 'Materia guardada', 'success');
  e.target.reset();
  cargarMaterias();
});

window.borrarMateria = async (id) => {
  if (confirm('¿Eliminar materia?')) {
    await fetch(`${API}/materias/${id}`, { method: 'DELETE' });
    cargarMaterias();
  }
};

// ==============================
// ESTUDIANTES
// ==============================
async function cargarEstudiantes() {
  const res = await fetch(`${API}/estudiantes`);
  const estudiantes = await res.json();

  const tabla = document.getElementById('tabla-estudiantes-body');
  const select = document.getElementById('nota-estudiante');

  tabla.innerHTML = '';
  select.innerHTML = '<option value="">Seleccione Estudiante...</option>';

  estudiantes.forEach(e => {
    tabla.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">#${e.id}</td>
        <td>${e.cedula}</td>
        <td>${e.nombre}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger"
            onclick="borrarEstudiante('${e.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
    select.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
  });
}

document.getElementById('form-estudiante').addEventListener('submit', async (e) => {
  e.preventDefault();

  await fetch(`${API}/estudiantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cedula: document.getElementById('est-cedula').value,
      nombre: document.getElementById('est-nombre').value
    })
  });

  Swal.fire('Listo', 'Estudiante registrado', 'success');
  e.target.reset();
  cargarEstudiantes();
});

window.borrarEstudiante = async (id) => {
  if (confirm('¿Eliminar estudiante?')) {
    await fetch(`${API}/estudiantes/${id}`, { method: 'DELETE' });
    cargarEstudiantes();
  }
};

// ==============================
// NOTAS
// ==============================
async function cargarNotas() {
  const res = await fetch(`${API}/notas`);
  const notas = await res.json();

  if (!Array.isArray(notas)) return;

  const tabla = document.getElementById('tabla-notas-body');
  tabla.innerHTML = '';

  notas.forEach(n => {
    tabla.innerHTML += `
      <tr>
        <td class="ps-4 fw-bold text-muted">${n.estudiante}</td>
        <td>${n.materia}</td>
        <td><span class="badge bg-warning text-dark fs-6">${n.nota}</span></td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger"
            onclick="borrarNota('${n.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

document.getElementById('form-notas').addEventListener('submit', async (e) => {
  e.preventDefault();

  const res = await fetch(`${API}/notas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estudiante_id: document.getElementById('nota-estudiante').value,
      materia_id: document.getElementById('nota-materia').value,
      nota: document.getElementById('nota-valor').value
    })
  });

  if (res.ok) {
    Swal.fire('Guardado', 'Calificación asignada', 'success');
    document.getElementById('nota-valor').value = '';
    cargarNotas();
  } else {
    Swal.fire('Error', 'No se pudo guardar', 'error');
  }
});

window.borrarNota = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar calificación?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, borrar'
  });

  if (isConfirmed) {
    await fetch(`${API}/notas/${id}`, { method: 'DELETE' });
    Swal.fire('Eliminado', 'Nota eliminada', 'success');
    cargarNotas();
  }
};
