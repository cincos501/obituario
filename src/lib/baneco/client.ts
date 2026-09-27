import { banecoCrypto } from './crypto';
import { BanecoConfig } from './types';

/**
 * Cliente HTTP y Gestor de Autenticación para Banco Económico (API Market)
 */
export class BanecoClient {
  private config: BanecoConfig;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0; // Timestamp en ms

  constructor(customConfig?: Partial<BanecoConfig>) {
    this.config = {
      baseUrl: (customConfig?.baseUrl || process.env.BANECO_BASE_URL || 'https://apimkt.baneco.com.bo/ApiGateway/').replace(/\/+$/, ''),
      username: customConfig?.username || process.env.BANECO_USERNAME || 'A122622560',
      password: customConfig?.password || process.env.BANECO_PASSWORD || '1502',
      aesKey: customConfig?.aesKey || process.env.BANECO_AES_KEY || 'D783FBCE6A634FE189DDE6FB525125E3',
      account: customConfig?.account || process.env.BANECO_ACCOUNT || '6111329426',
      timeout: Number(customConfig?.timeout || process.env.BANECO_TIMEOUT) || 30,
    };
  }

  /**
   * Obtiene un Bearer Token válido. Si ya está en memoria y no ha expirado,
   * lo reutiliza; de lo contrario, solicita uno nuevo a la API de Baneco.
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Reutilizar token si aún quedan al menos 2 minutos de vigencia
    if (this.cachedToken && this.tokenExpiresAt > now + 120_000) {
      return this.cachedToken;
    }

    return await this.authenticate();
  }

  /**
   * Solicita un nuevo Bearer Token autenticándose con las credenciales cifradas.
   */
  public async authenticate(): Promise<string> {
    const { baseUrl, username, password, timeout } = this.config;

    if (!username || !password) {
      console.warn('BanecoClient: Credenciales BANECO_USERNAME o BANECO_PASSWORD no configuradas.');
      return '';
    }

    // Cifrar la contraseña utilizando AES-256-CBC según especificación
    const encryptedPassword = banecoCrypto.encrypt(password);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    const authUrl = `${baseUrl}/api/authentication/authenticate`;

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userName: username,
          password: encryptedPassword,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`BanecoClient: Error HTTP ${response.status} en autenticación:`, errorText);
        throw new Error(`Fallo de autenticación en Banco Económico (HTTP ${response.status})`);
      }

      const data = await response.json();

      // La API devuelve { responseCode: 0, message: "...", token: "..." }
      if (data.responseCode !== 0 && data.responseCode !== undefined) {
        console.error('BanecoClient: Respuesta rechazada por Baneco:', data);
        throw new Error(data.message || 'Error en respuesta de autenticación de Baneco');
      }

      const token = data.token || data.accessToken || data.data?.token;
      if (!token) {
        console.error('BanecoClient: La respuesta no contiene un token válido:', data);
        throw new Error('Banco Económico no devolvió token de sesión.');
      }

      // Cachear en memoria por 55 minutos (3300 segundos)
      this.cachedToken = token;
      this.tokenExpiresAt = Date.now() + 55 * 60 * 1000;

      return token;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`BanecoClient: Timeout de ${timeout}s al conectar con ${authUrl}`);
      } else {
        console.error('BanecoClient: Excepción en authenticate():', error?.message || error);
      }
      throw error;
    }
  }

  /**
   * Ejecuta peticiones autenticadas al ApiGateway de Baneco con Bearer Token,
   * control de tiempo de espera y manejo de cabeceras.
   */
  public async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    bodyData?: any,
    queryParams?: Record<string, string | number>
  ): Promise<T> {
    const token = await this.getAccessToken();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let url = `${this.config.baseUrl}${cleanEndpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => searchParams.append(k, String(v)));
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout * 1000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: bodyData && method !== 'GET' ? JSON.stringify(bodyData) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { responseCode: response.ok ? 0 : -1, message: text };
        }
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`BanecoClient: Error al ejecutar ${method} ${url}:`, error?.message || error);
      throw error;
    }
  }

  public getConfig(): BanecoConfig {
    return { ...this.config };
  }
}

export const banecoClient = new BanecoClient();
