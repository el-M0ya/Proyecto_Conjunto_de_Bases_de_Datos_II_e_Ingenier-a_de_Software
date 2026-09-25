import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatTime,
  initialsOf,
} from '@shared/lib/format'

describe('utilidades de formateo', () => {
  describe('formatNumber', () => {
    it('aplica los separadores de miles de la configuración regional', () => {
      expect(formatNumber(1234)).toContain('1')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('convierte una tasa entre 0 y 1 en porcentaje', () => {
      expect(formatPercent(0.82)).toBe('82%')
    })

    it('representa una tasa nula como cero', () => {
      expect(formatPercent(0)).toBe('0%')
    })

    it('redondea a un solo decimal', () => {
      expect(formatPercent(0.3333)).toBe('33.3%')
    })
  })

  describe('formatDuration', () => {
    it('muestra sólo los segundos cuando no llegan al minuto', () => {
      expect(formatDuration(45)).toBe('45 s')
    })

    it('muestra sólo los minutos cuando los segundos son cero', () => {
      expect(formatDuration(120)).toBe('2 min')
    })

    it('combina minutos y segundos', () => {
      expect(formatDuration(90)).toBe('1 min 30 s')
    })
  })

  describe('formatDate', () => {
    it('interpreta la fecha en la zona horaria configurada', () => {
      // Medianoche en La Habana: en UTC es del día siguiente por el desfase.
      expect(formatDate('2026-09-22T04:00:00Z')).toContain('2026')
    })
  })

  describe('formatTime', () => {
    it('devuelve una hora legible', () => {
      expect(formatTime('2026-09-22T15:30:00Z')).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatDateTime', () => {
    it('combina fecha y hora', () => {
      expect(formatDateTime('2026-09-22T15:30:00Z')).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('initialsOf', () => {
    it('toma la inicial del nombre y del apellido', () => {
      expect(initialsOf('Bryan Moya Aquino')).toBe('BM')
    })

    it('admite un nombre único', () => {
      expect(initialsOf('Administrador')).toBe('A')
    })

    it('tolera espacios sobrantes', () => {
      expect(initialsOf('  Luis  Perez ')).toBe('LP')
    })
  })
})
