import crypto from 'crypto';

/**
 * Servicio de Criptografía AES-256-CBC para Banco Económico (Baneco).
 * Cumple estrictamente con la especificación de Baneco API Market v1.3.0:
 * - Algoritmo: AES-256-CBC con PKCS#7 padding.
 * - Longitud de clave: 32 bytes exactos (truncada o rellenada con \0 si difiere).
 * - Vector de Inicialización (IV): 16 bytes aleatorios criptográficos.
 * - Formato de Salida: Base64(IV [16 bytes] + Texto Cifrado).
 */
export class BanecoCrypto {
  private key: Buffer;

  constructor(customKey?: string) {
    const rawKey = customKey || process.env.BANECO_AES_KEY || 'D783FBCE6A634FE189DDE6FB525125E3';
    
    // Rellenar con \0 o truncar exactamente a 32 bytes
    const keyBuffer = Buffer.alloc(32, 0);
    const rawBuffer = Buffer.from(rawKey, 'utf-8');
    rawBuffer.copy(keyBuffer, 0, 0, Math.min(rawBuffer.length, 32));
    this.key = keyBuffer;
  }

  /**
   * Cifra un texto en plano utilizando AES-256-CBC.
   * @param text Cadena a cifrar (ej. contraseña o número de cuenta bancaria)
   * @returns Cadena codificada en Base64 con el IV prefijado
   */
  public encrypt(text: string): string {
    if (!text) return '';

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
      const encrypted = Buffer.concat([
        cipher.update(text, 'utf-8'),
        cipher.final(),
      ]);

      // Formato requerido: Base64(IV + Ciphertext)
      return Buffer.concat([iv, encrypted]).toString('base64');
    } catch (error) {
      console.error('BanecoCrypto: Error durante el cifrado AES-256-CBC:', error);
      throw new Error('Fallo en el cifrado de datos de seguridad de Baneco');
    }
  }

  /**
   * Descifra una cadena Base64 generada con AES-256-CBC.
   * @param cipherTextBase64 Cadena en Base64 que contiene IV (primeros 16 bytes) + Ciphertext
   * @returns Cadena en texto plano
   */
  public decrypt(cipherTextBase64: string): string {
    if (!cipherTextBase64) return '';

    try {
      const combined = Buffer.from(cipherTextBase64, 'base64');
      if (combined.length < 17) {
        throw new Error('El buffer cifrado es demasiado corto para contener IV y datos.');
      }

      const iv = combined.subarray(0, 16);
      const cipherText = combined.subarray(16);

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
      const decrypted = Buffer.concat([
        decipher.update(cipherText),
        decipher.final(),
      ]);

      return decrypted.toString('utf-8');
    } catch (error) {
      console.error('BanecoCrypto: Error durante el descifrado AES-256-CBC:', error);
      throw new Error('Fallo en el descifrado de datos de seguridad de Baneco');
    }
  }
}

// Instancia singleton para uso en el servidor
export const banecoCrypto = new BanecoCrypto();
