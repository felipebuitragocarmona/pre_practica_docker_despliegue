# Proxy inverso con Nginx + FastAPI + MySQL + Docker Compose

Arquitectura:

- `nginx`: punto único de entrada, sirve el front y enruta a los backends.
- `front`: HTML/CSS/JS básico.
- `security-backend`: API FastAPI para gestión CRUD de usuarios.
- `cine-backend`: API FastAPI para gestión CRUD de películas.
- `mysql`: contenedor MySQL compartido con dos bases de datos:
  - `security_db`
  - `cine_db`

## Ejecutar

Primero crea tu archivo de variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Luego levanta los servicios:

```bash
docker compose up --build
```

Variables requeridas en `.env`:

```text
MYSQL_ROOT_PASSWORD
SECURITY_DATABASE_URL
CINE_DATABASE_URL
```

Abrir:

```text
http://localhost:8181
```

## Endpoints

### Usuarios

Base vía Nginx:

```text
/api/security/users
```

Operaciones:

```text
GET    /api/security/users
GET    /api/security/users/{id}
POST   /api/security/users
PUT    /api/security/users/{id}
DELETE /api/security/users/{id}
```

### Películas

Base vía Nginx:

```text
/api/cine/movies
```

Operaciones:

```text
GET    /api/cine/movies
GET    /api/cine/movies/{id}
POST   /api/cine/movies
PUT    /api/cine/movies/{id}
DELETE /api/cine/movies/{id}
```

## Persistencia

Los datos se guardan en el volumen Docker:

```text
mysql_data
```

Para borrar todo y empezar desde cero:

```bash
docker compose down -v
docker compose up --build
```
