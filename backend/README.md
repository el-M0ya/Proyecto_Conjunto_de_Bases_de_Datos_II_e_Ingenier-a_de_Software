# Backend - Gym Training

API REST con FastAPI + PostgreSQL para gestión de planes de entrenamiento.

## Requisitos

- Python 3.10+
- PostgreSQL 14+

## Instalación

```bash
# 1. Crear entorno virtual
python -m venv venv

# 2. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# 5. Crear base de datos en PostgreSQL
createdb gym_training

# 6. Ejecutar migraciones (crear tablas)
# Las tablas se crean automáticamente al iniciar la aplicación

# 7. Iniciar servidor
uvicorn app.main:app --reload
```

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/exercises | Listar ejercicios |
| POST | /api/exercises | Crear ejercicio |
| GET | /api/exercises/{id} | Obtener ejercicio |
| PUT | /api/exercises/{id} | Actualizar ejercicio |
| DELETE | /api/exercises/{id} | Eliminar ejercicio |
| GET | /api/programs | Listar programas |
| POST | /api/programs | Crear programa |
| GET | /api/programs/{id} | Obtener programa |
| PUT | /api/programs/{id} | Actualizar programa |
| DELETE | /api/programs/{id} | Eliminar programa |
| GET | /api/trainers | Listar entrenadores |
| POST | /api/trainers | Crear entrenador |
| GET | /api/trainers/{id} | Obtener entrenador |
| PUT | /api/trainers/{id} | Actualizar entrenador |
| DELETE | /api/trainers/{id} | Eliminar entrenador |
| GET | /api/clients | Listar clientes |
| POST | /api/clients | Crear cliente |
| GET | /api/clients/{id} | Obtener cliente |
| PUT | /api/clients/{id} | Actualizar cliente |
| DELETE | /api/clients/{id} | Eliminar cliente |

## Documentación interactiva

Una vez iniciado el servidor, visita:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
