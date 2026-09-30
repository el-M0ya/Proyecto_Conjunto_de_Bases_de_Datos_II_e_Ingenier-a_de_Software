/**
 * Página de prueba genérica.
 * 
 * Este componente sirve para verificar que el backend funciona correctamente.
 * El colaborador del frontend puede reemplazar este archivo con su propia
 * implementación, usando los endpoints definidos en services/api.js
 */
import { useState, useEffect } from 'react'
import { getExercises, getPrograms, getTrainers, getClients } from './services/api'

function App() {
  const [data, setData] = useState({ exercises: [], programs: [], trainers: [], clients: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [exercises, programs, trainers, clients] = await Promise.all([
        getExercises(),
        getPrograms(),
        getTrainers(),
        getClients(),
      ])
      setData({
        exercises: exercises.data,
        programs: programs.data,
        trainers: trainers.data,
        clients: clients.data,
      })
    } catch (err) {
      setError('Error al conectar con el backend. ¿Está corriendo en puerto 8000?')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <h1>Gym Training - API Test</h1>
      <p>Este es un frontend genérico para probar el backend. El colaborador puede reemplazarlo.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginTop: 30 }}>
        <div style={{ padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h2>Ejercicios ({data.exercises.length})</h2>
          <ul>
            {data.exercises.slice(0, 5).map(ex => (
              <li key={ex.id}>{ex.name} - {ex.muscle_group}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h2>Programas ({data.programs.length})</h2>
          <ul>
            {data.programs.slice(0, 5).map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h2>Entrenadores ({data.trainers.length})</h2>
          <ul>
            {data.trainers.slice(0, 5).map(t => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h2>Clientes ({data.clients.length})</h2>
          <ul>
            {data.clients.slice(0, 5).map(c => (
              <li key={c.id}>{c.name} - {c.location}</li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={loadData} style={{ marginTop: 30, padding: '10px 20px' }}>
        Recargar datos
      </button>
    </div>
  )
}

export default App
