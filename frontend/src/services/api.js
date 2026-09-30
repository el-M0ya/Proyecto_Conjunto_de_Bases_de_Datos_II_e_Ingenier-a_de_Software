/**
 * Cliente API para el backend FastAPI.
 * 
 * Este archivo define TODOS los endpoints disponibles.
 * El colaborador del frontend puede usar este archivo como referencia
 * para conectar su propio frontend.
 * 
 * Base URL: /api (configurado en vite.config.js como proxy)
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============ EJERCIOS ============

/**
 * Obtiene todos los ejercicios.
 * @param {Object} params - Filtros opcionales
 * @param {string} params.muscleGroup - Filtrar por grupo muscular
 * @param {string} params.type - Filtrar por tipo (FUERZA, CARDIO, FLEXIBILIDAD)
 * @param {string} params.intensity - Filtrar por intensidad (BAJO, MEDIO, ALTO)
 * @returns {Promise<Array>} Lista de ejercicios
 * 
 * Ejemplo: GET /api/exercises?muscleGroup=PECHO&intensity=ALTO
 */
export const getExercises = (params) => api.get('/exercises', { params })

/**
 * Obtiene un ejercicio por ID.
 * @param {string} id - ID del ejercicio
 * @returns {Promise<Object>} Ejercicio
 * 
 * Ejemplo: GET /api/exercises/550e8400-e29b-41d4-a716-446655440000
 */
export const getExercise = (id) => api.get(`/exercises/${id}`)

/**
 * Crea un nuevo ejercicio.
 * @param {Object} data - Datos del ejercicio
 * @param {string} data.name - Nombre (requerido)
 * @param {string} data.description - Descripción (opcional)
 * @param {string} data.muscleGroup - Grupo muscular (requerido)
 * @param {string} data.type - Tipo: FUERZA, CARDIO, FLEXIBILIDAD (requerido)
 * @param {string} data.intensity - Intensidad: BAJO, MEDIO, ALTO (requerido)
 * @param {string} data.created_by_id - ID del entrenador (requerido)
 * @returns {Promise<Object>} Ejercicio creado
 * 
 * Ejemplo: POST /api/exercises
 * Body: { "name": "Press banca", "muscleGroup": "PECHO", "type": "FUERZA", "intensity": "ALTO", "created_by_id": "uuid" }
 */
export const createExercise = (data) => api.post('/exercises', data)

/**
 * Actualiza un ejercicio.
 * @param {string} id - ID del ejercicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Ejercicio actualizado
 * 
 * Ejemplo: PUT /api/exercises/550e8400-e29b-41d4-a716-446655440000
 */
export const updateExercise = (id, data) => api.put(`/exercises/${id}`, data)

/**
 * Elimina un ejercicio.
 * @param {string} id - ID del ejercicio
 * 
 * Ejemplo: DELETE /api/exercises/550e8400-e29b-41d4-a716-446655440000
 */
export const deleteExercise = (id) => api.delete(`/exercises/${id}`)

// ============ PROGRAMAS ============

/**
 * Obtiene todos los programas.
 * @returns {Promise<Array>} Lista de programas
 * 
 * Ejemplo: GET /api/programs
 */
export const getPrograms = () => api.get('/programs')

/**
 * Obtiene un programa por ID.
 * @param {string} id - ID del programa
 * @returns {Promise<Object>} Programa
 * 
 * Ejemplo: GET /api/programs/550e8400-e29b-41d4-a716-446655440000
 */
export const getProgram = (id) => api.get(`/programs/${id}`)

/**
 * Crea un nuevo programa.
 * @param {Object} data - Datos del programa
 * @param {string} data.name - Nombre (requerido)
 * @param {string} data.objective - Objetivo (requerido)
 * @param {Array<string>} data.muscle_groups - Grupos musculares (requerido)
 * @returns {Promise<Object>} Programa creado
 * 
 * Ejemplo: POST /api/programs
 * Body: { "name": "Hipertrofia", "objective": "Ganar masa muscular", "muscle_groups": ["PECHO", "ESPALDA"] }
 */
export const createProgram = (data) => api.post('/programs', data)

/**
 * Actualiza un programa.
 * @param {string} id - ID del programa
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Programa actualizado
 * 
 * Ejemplo: PUT /api/programs/550e8400-e29b-41d4-a716-446655440000
 */
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)

/**
 * Elimina un programa.
 * @param {string} id - ID del programa
 * 
 * Ejemplo: DELETE /api/programs/550e8400-e29b-41d4-a716-446655440000
 */
export const deleteProgram = (id) => api.delete(`/programs/${id}`)

// ============ ENTRENADORES ============

/**
 * Obtiene todos los entrenadores.
 * @returns {Promise<Array>} Lista de entrenadores
 * 
 * Ejemplo: GET /api/trainers
 */
export const getTrainers = () => api.get('/trainers')

/**
 * Obtiene un entrenador por ID.
 * @param {string} id - ID del entrenador
 * @returns {Promise<Object>} Entrenador
 * 
 * Ejemplo: GET /api/trainers/550e8400-e29b-41d4-a716-446655440000
 */
export const getTrainer = (id) => api.get(`/trainers/${id}`)

/**
 * Crea un nuevo entrenador.
 * @param {Object} data - Datos del entrenador
 * @param {string} data.name - Nombre (requerido)
 * @param {string} data.specialty - Especialidad (requerido)
 * @returns {Promise<Object>} Entrenador creado
 * 
 * Ejemplo: POST /api/trainers
 * Body: { "name": "Juan Pérez", "specialty": "Hipertrofia" }
 */
export const createTrainer = (data) => api.post('/trainers', data)

/**
 * Actualiza un entrenador.
 * @param {string} id - ID del entrenador
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Entrenador actualizado
 * 
 * Ejemplo: PUT /api/trainers/550e8400-e29b-41d4-a716-446655440000
 */
export const updateTrainer = (id, data) => api.put(`/trainers/${id}`, data)

/**
 * Elimina un entrenador.
 * @param {string} id - ID del entrenador
 * 
 * Ejemplo: DELETE /api/trainers/550e8400-e29b-41d4-a716-446655440000
 */
export const deleteTrainer = (id) => api.delete(`/trainers/${id}`)

// ============ CLIENTES ============

/**
 * Obtiene todos los clientes.
 * @returns {Promise<Array>} Lista de clientes
 * 
 * Ejemplo: GET /api/clients
 */
export const getClients = () => api.get('/clients')

/**
 * Obtiene un cliente por ID.
 * @param {string} id - ID del cliente
 * @returns {Promise<Object>} Cliente
 * 
 * Ejemplo: GET /api/clients/550e8400-e29b-41d4-a716-446655440000
 */
export const getClient = (id) => api.get(`/clients/${id}`)

/**
 * Crea un nuevo cliente.
 * @param {Object} data - Datos del cliente
 * @param {string} data.name - Nombre (requerido)
 * @param {number} data.age - Edad (requerido)
 * @param {string} data.location - Sede (requerido)
 * @returns {Promise<Object>} Cliente creado
 * 
 * Ejemplo: POST /api/clients
 * Body: { "name": "María García", "age": 28, "location": "Sede Centro" }
 */
export const createClient = (data) => api.post('/clients', data)

/**
 * Actualiza un cliente.
 * @param {string} id - ID del cliente
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Cliente actualizado
 * 
 * Ejemplo: PUT /api/clients/550e8400-e29b-41d4-a716-446655440000
 */
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)

/**
 * Elimina un cliente.
 * @param {string} id - ID del cliente
 * 
 * Ejemplo: DELETE /api/clients/550e8400-e29b-41d4-a716-446655440000
 */
export const deleteClient = (id) => api.delete(`/clients/${id}`)

export default api
