const userApi = "/api/security/users";
const movieApi = "/api/cine/movies";

function showMessage(text) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.style.display = "block";

  setTimeout(() => {
    message.style.display = "none";
  }, 2500);
}

async function handleResponse(response) {
  if (!response.ok) {
    let detail = "Error en la operación";
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/* Usuarios */

async function loadUsers() {
  const response = await fetch(userApi);
  const users = await handleResponse(response);

  const tbody = document.getElementById("usersTable");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button onclick='editUser(${JSON.stringify(user)})'>Editar</button>
        <button class="danger" onclick="deleteUser(${user.id})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function editUser(user) {
  document.getElementById("userId").value = user.id;
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userRole").value = user.role;
}

function resetUserForm() {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
}

async function saveUser(event) {
  event.preventDefault();

  const id = document.getElementById("userId").value;
  const payload = {
    name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    role: document.getElementById("userRole").value,
  };

  try {
    const response = await fetch(id ? `${userApi}/${id}` : userApi, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    resetUserForm();
    await loadUsers();
    showMessage(id ? "Usuario actualizado" : "Usuario creado");
  } catch (error) {
    showMessage(error.message);
  }
}

async function deleteUser(id) {
  if (!confirm("¿Eliminar este usuario?")) return;

  try {
    const response = await fetch(`${userApi}/${id}`, {
      method: "DELETE",
    });

    await handleResponse(response);
    await loadUsers();
    showMessage("Usuario eliminado");
  } catch (error) {
    showMessage(error.message);
  }
}

/* Películas */

async function loadMovies() {
  const response = await fetch(movieApi);
  const movies = await handleResponse(response);

  const tbody = document.getElementById("moviesTable");
  tbody.innerHTML = "";

  movies.forEach((movie) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${movie.id}</td>
      <td>${movie.title}</td>
      <td>${movie.genre}</td>
      <td>${movie.year}</td>
      <td>${movie.director || ""}</td>
      <td>
        <button onclick='editMovie(${JSON.stringify(movie)})'>Editar</button>
        <button class="danger" onclick="deleteMovie(${movie.id})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function editMovie(movie) {
  document.getElementById("movieId").value = movie.id;
  document.getElementById("movieTitle").value = movie.title;
  document.getElementById("movieGenre").value = movie.genre;
  document.getElementById("movieYear").value = movie.year;
  document.getElementById("movieDirector").value = movie.director || "";
}

function resetMovieForm() {
  document.getElementById("movieForm").reset();
  document.getElementById("movieId").value = "";
}

async function saveMovie(event) {
  event.preventDefault();

  const id = document.getElementById("movieId").value;
  const payload = {
    title: document.getElementById("movieTitle").value,
    genre: document.getElementById("movieGenre").value,
    year: Number(document.getElementById("movieYear").value),
    director: document.getElementById("movieDirector").value || null,
  };

  try {
    const response = await fetch(id ? `${movieApi}/${id}` : movieApi, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await handleResponse(response);
    resetMovieForm();
    await loadMovies();
    showMessage(id ? "Película actualizada" : "Película creada");
  } catch (error) {
    showMessage(error.message);
  }
}

async function deleteMovie(id) {
  if (!confirm("¿Eliminar esta película?")) return;

  try {
    const response = await fetch(`${movieApi}/${id}`, {
      method: "DELETE",
    });

    await handleResponse(response);
    await loadMovies();
    showMessage("Película eliminada");
  } catch (error) {
    showMessage(error.message);
  }
}

document.getElementById("userForm").addEventListener("submit", saveUser);
document.getElementById("movieForm").addEventListener("submit", saveMovie);

loadUsers();
loadMovies();
