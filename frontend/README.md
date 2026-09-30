# Frontend - Gym Training (Genérico)

Frontend genérico para probar la conexión con el backend.

## Para el colaborador del frontend

Este frontend es solo una prueba. Para conectar tu propio frontend:

1. **Revisa `src/services/api.js`** - Ahí están todos los endpoints documentados
2. **Cambia la URL base** en `vite.config.js` si tu backend está en otro puerto
3. **Reemplaza `src/App.jsx`** con tu propia implementación

## Endpoints disponibles

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

## Ejemplo de uso

```javascript
import { getExercises, createExercise } from './services/api'

// Obtener ejercicios
const { data } = await getExercises({ muscleGroup: 'PECHO' })

// Crear ejercicio
await createExercise({
  name: 'Press banca',
  muscleGroup: 'PECHO',
  type: 'FUERZA',
  intensity: 'ALTO',
  created_by_id: 'uuid-del-entrenador'
})
```
