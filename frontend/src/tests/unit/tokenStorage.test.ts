import { TokenStorage } from '@core/auth/tokenStorage'
import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@core/storage/storeFactory'

/** Almacenamiento limpio para cada caso de prueba. */
beforeEach(() => {
  localStorage.clear()
})

describe('estrategia de almacenamiento de tokens', () => {
  it('devuelve null cuando no hay sesión', () => {
    const storage = new TokenStorage()
    expect(storage.getTokens()).toBeNull()
    expect(storage.getAccessToken()).toBeNull()
  })

  it('persiste y recupera los tokens de una sesión', () => {
    const storage = new TokenStorage()
    const expiraEn = Date.now() + 3_600_000

    storage.setTokens({ accessToken: 'abc', refreshToken: 'xyz', expiresAt: expiraEn })

    expect(storage.getTokens()).toEqual({
      accessToken: 'abc',
      refreshToken: 'xyz',
      expiresAt: expiraEn,
    })
    expect(storage.getAccessToken()).toBe('abc')
  })

  it('descarta el dato corrupto en lugar de propagarlo', () => {
    const storage = new TokenStorage()
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, '{no es json válido')

    expect(storage.getTokens()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
  })

  it('descarta una sesión sin token de acceso', () => {
    const storage = new TokenStorage()
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify({ refreshToken: 'xyz' }))

    expect(storage.getTokens()).toBeNull()
  })

  it('considera caducada una sesión sin token', () => {
    expect(new TokenStorage().isExpired()).toBe(true)
  })

  it('considera vigente un token sin fecha de expiración', () => {
    const storage = new TokenStorage()
    storage.setTokens({ accessToken: 'abc', refreshToken: null, expiresAt: null })

    expect(storage.isExpired()).toBe(false)
  })

  it('considera caducado un token que ya expiró', () => {
    const storage = new TokenStorage()
    storage.setTokens({ accessToken: 'abc', refreshToken: null, expiresAt: Date.now() - 1_000 })

    expect(storage.isExpired()).toBe(true)
  })

  it('renueva el token conservando el token de renovación', () => {
    const storage = new TokenStorage()
    storage.setTokens({ accessToken: 'viejo', refreshToken: 'refresh', expiresAt: 1_000 })

    storage.updateAccessToken('nuevo', 9_999)

    expect(storage.getTokens()).toEqual({
      accessToken: 'nuevo',
      refreshToken: 'refresh',
      expiresAt: 9_999,
    })
  })

  it('elimina la sesión persistida', () => {
    const storage = new TokenStorage()
    storage.setTokens({ accessToken: 'abc', refreshToken: null, expiresAt: null })

    storage.clear()

    expect(storage.getTokens()).toBeNull()
  })
})
