import type { UserProfile } from '@domain/entities'
import { tokenStorage } from '@core/auth/tokenStorage'
import type { AuthRepository, AuthSession } from '@domain/repositories'
import type { HttpClient } from '@core/http'
import { toUserProfile, type UserProfileDto } from '../mappers'

/** DTO crudo de la respuesta de autenticación. */
interface AuthSessionDto {
  accessToken: string
  refreshToken?: string | null
  expiresAt?: number | null
  usuario: UserProfileDto
}

/**
 * Implementación HTTP del repositorio de autenticación.
 *
 * A diferencia del resto de repositorios, éste gestiona por sí mismo la
 * persistencia de la sesión a través de {@link tokenStorage}: es el único
 * punto del sistema que escribe y lee tokens, lo que evita que la lógica de
 * sesión se disperse entre distintos módulos.
 */
export class HttpAuthRepository implements AuthRepository {
  /** Cliente HTTP utilizado para las llamadas de autenticación. */
  private readonly http: HttpClient

  /**
   * Crea el repositorio de autenticación.
   *
   * @param http Cliente HTTP a utilizar.
   */
  constructor(http: HttpClient) {
    this.http = http
  }

  /**
   * Autentica al usuario y persiste la sesión resultante.
   *
   * @param credenciales Correo y contraseña del usuario.
   * @returns La sesión iniciada.
   */
  async login(credenciales: { correo: string; password: string }): Promise<AuthSession> {
    const dto = await this.http.request<AuthSessionDto>({
      method: 'POST',
      url: '/auth/login',
      body: credenciales,
    })
    return this.persist(dto)
  }

  /**
   * Renueva el token de acceso de la sesión vigente.
   *
   * @param refreshToken Token de renovación almacenado.
   * @returns Sesión con el token de acceso renovado.
   */
  async refresh(refreshToken: string): Promise<AuthSession> {
    const dto = await this.http.request<AuthSessionDto>({
      method: 'POST',
      url: '/auth/refresh',
      body: { refreshToken },
    })
    return this.persist(dto)
  }

  /**
   * Cierra la sesión en el backend y descarta los tokens locales.
   *
   * El borrado local se ejecuta incluso si la llamada remota falla: el usuario
   * debe poder salir de la aplicación aunque el servidor no responda.
   *
   * @param accessToken Token de acceso vigente.
   */
  async logout(accessToken: string): Promise<void> {
    try {
      await this.http.request<null>({
        method: 'POST',
        url: '/auth/logout',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } finally {
      tokenStorage.clear()
    }
  }

  /**
   * Recupera el perfil del usuario autenticado.
   *
   * @param accessToken Token de acceso vigente.
   * @returns Perfil con los roles asignados.
   */
  async me(accessToken: string): Promise<UserProfile> {
    const dto = await this.http.request<UserProfileDto>({
      method: 'GET',
      url: '/auth/me',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return toUserProfile(dto)
  }

  /**
   * Traduce el DTO de sesión y guarda los tokens en el almacenamiento.
   *
   * @param dto Respuesta de autenticación del backend.
   * @returns Sesión normalizada.
   */
  private persist(dto: AuthSessionDto): AuthSession {
    const session: AuthSession = {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken ?? null,
      expiresAt: dto.expiresAt ?? null,
      usuario: toUserProfile(dto.usuario),
    }

    tokenStorage.setTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    })

    return session
  }
}
