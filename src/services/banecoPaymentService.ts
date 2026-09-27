import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured } from './supabase';
import { SubscriptionPlanId } from '../types/memorial';

export type BanecoPaymentMethod = 'qr_simple' | 'transfer';
export type BanecoPaymentStatus = 'pending' | 'completed' | 'expired' | 'failed';

export interface BanecoTransaction {
  id: string;
  transactionNumber: string;
  obituaryId?: string;
  planId: SubscriptionPlanId;
  amountBob: number;
  amountUsd: number;
  paymentMethod: BanecoPaymentMethod;
  status: BanecoPaymentStatus;
  destinationAccount: string;
  qrPayload?: string;
  qrImageUrl?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  bankAuthorizationCode?: string;
  banecoTransactionId?: string;
  expiresAt: string;
  paidAt?: string;
  createdAt: string;
}

const STORAGE_TX_KEY = 'hobituario_baneco_transactions_v1';

// Credenciales y Parámetros Oficiales Banco Económico (Baneco)
export const BANECO_CONFIG = {
  baseUrl: process.env.BANECO_BASE_URL || 'https://apimkt.baneco.com.bo/ApiGateway/',
  username: process.env.BANECO_USERNAME || 'A122622560',
  password: process.env.BANECO_PASSWORD || '1502',
  aesKey: process.env.BANECO_AES_KEY || 'D783FBCE6A634FE189DDE6FB525125E3',
  account: process.env.BANECO_ACCOUNT || '6111329426',
  timeout: Number(process.env.BANECO_TIMEOUT) || 30,
  expirationDays: Number(process.env.BANECO_QR_EXPIRATION_DAYS) || 1,
};

// Tarifas oficiales en Bolivianos (BOB)
export const PLAN_PRICES_BOB: Record<SubscriptionPlanId, number> = {
  esencial: 132.00,  // $19 USD
  legado: 341.00,    // $49 USD
  infinito: 689.00,  // $99 USD
};

export const PLAN_PRICES_USD: Record<SubscriptionPlanId, number> = {
  esencial: 19.00,
  legado: 49.00,
  infinito: 99.00,
};

/**
 * Calcula CRC16-CCITT (estándar EMVCo QR)
 */
function crc16Ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formatea un tag EMVCo con ID de 2 dígitos y longitud de 2 dígitos.
 */
function emvTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

class BanecoPaymentService {
  private getLocalTransactions(): BanecoTransaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_TX_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveLocalTransactions(txs: BanecoTransaction[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(txs));
    } catch (e) {
      console.warn('Error saving transactions to localStorage:', e);
    }
  }

  /**
   * Genera el payload estándar ASFI QR Simple EMVCo de Bolivia
   * Asociado directamente a la cuenta destino 6111329426 del Banco Económico (código 0010).
   */
  private generateAsfiQrPayload(params: {
    transactionNumber: string;
    amountBob: number;
    planName: string;
    account: string;
  }): string {
    const amountStr = params.amountBob.toFixed(2);
    const bankCode = '0010'; // Banco Económico ASFI

    // Tag 26: Información de cuenta recaudadora (Banco Económico)
    const tag00 = emvTag('00', 'bo.gob.asfi.qrsimple');
    const tag01 = emvTag('01', bankCode);
    const tag02 = emvTag('02', params.account); // 6111329426
    const tag03 = emvTag('03', params.transactionNumber);
    const tag26 = emvTag('26', `${tag00}${tag01}${tag02}${tag03}`);

    // Tag 62: Datos adicionales de referencia y concepto
    const tag62_05 = emvTag('05', params.transactionNumber);
    const tag62_08 = emvTag('08', `Hobituario ${params.planName}`.slice(0, 25));
    const tag62 = emvTag('62', `${tag62_05}${tag62_08}`);

    // Construcción del string completo
    const basePayload = 
      emvTag('00', '01') +             // Versión del formato
      emvTag('01', '12') +             // QR dinámico (con monto fijo)
      tag26 +                          // Datos de la cuenta Banco Económico
      emvTag('52', '0000') +           // Merchant Category
      emvTag('53', '068') +            // Moneda: Bolivianos (BOB)
      emvTag('54', amountStr) +        // Monto exacto en Bs
      emvTag('58', 'BO') +             // País: Bolivia
      emvTag('59', 'BANCO ECONOMICO') +// Titular / Entidad
      emvTag('60', 'SANTA CRUZ') +     // Ciudad
      tag62 +                          // Glosa y referencia
      '6304';                          // Prefijo de checksum

    const checksum = crc16Ccitt(basePayload);
    return `${basePayload}${checksum}`;
  }

  /**
   * Intenta llamar al ApiGateway de Banco Económico si está en servidor,
   * y construye el QR de alta resolución con el logo y estándares ASFI.
   */
  async createQrOrder(params: {
    planId: SubscriptionPlanId;
    planName: string;
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    obituaryId?: string;
  }): Promise<BanecoTransaction> {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionNumber = `BNE-${timestamp}-${randomSuffix}`;
    const amountBob = PLAN_PRICES_BOB[params.planId] || 341.00;
    const amountUsd = PLAN_PRICES_USD[params.planId] || 49.00;
    const account = BANECO_CONFIG.account; // 6111329426

    // Vigencia configurada (por defecto 1 día o 24 horas)
    const expirationMs = BANECO_CONFIG.expirationDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(timestamp + Math.min(expirationMs, 15 * 60 * 1000)).toISOString();

    // Generar payload oficial ASFI con la cuenta 6111329426 de Baneco
    let qrPayload = this.generateAsfiQrPayload({
      transactionNumber,
      amountBob,
      planName: params.planName,
      account,
    });

    // Si estamos en entorno servidor y el ApiGateway responde, intentar llamada REST
    if (typeof window === 'undefined') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const apiResponse = await fetch(`${BANECO_CONFIG.baseUrl}api/v1/qr/generar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${BANECO_CONFIG.username}:${BANECO_CONFIG.password}`).toString('base64'),
          },
          body: JSON.stringify({
            cuenta: account,
            monto: amountBob,
            moneda: 'BOB',
            glosa: `Hobituario ${params.planName}`,
            referencia: transactionNumber,
            diasVigencia: BANECO_CONFIG.expirationDays,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData?.qr || apiData?.qrTexto || apiData?.qrImage) {
            qrPayload = apiData.qr || apiData.qrTexto || qrPayload;
          }
        }
      } catch (e) {
        // En caso de firewall o timeout bancario, se utiliza el payload ASFI directo
      }
    }

    // Renderizar imagen PNG del código QR
    let qrImageUrl = '';
    try {
      qrImageUrl = await QRCode.toDataURL(qrPayload, {
        width: 380,
        margin: 2,
        color: {
          dark: '#1C1917',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('Error generando QR image:', err);
    }

    const newTx: BanecoTransaction = {
      id: 'tx-' + timestamp,
      transactionNumber,
      obituaryId: params.obituaryId,
      planId: params.planId,
      amountBob,
      amountUsd,
      paymentMethod: 'qr_simple',
      status: 'pending',
      destinationAccount: account,
      qrPayload,
      qrImageUrl,
      payerName: params.payerName || 'Familiar Titular',
      payerEmail: params.payerEmail,
      payerPhone: params.payerPhone,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    // Guardar en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('baneco_transactions')
          .insert({
            transaction_number: newTx.transactionNumber,
            obituary_id: newTx.obituaryId || null,
            plan_id: newTx.planId,
            amount_bob: newTx.amountBob,
            amount_usd: newTx.amountUsd,
            payment_method: newTx.paymentMethod,
            status: newTx.status,
            qr_payload: newTx.qrPayload,
            qr_image_url: newTx.qrImageUrl,
            payer_name: newTx.payerName,
            payer_email: newTx.payerEmail || null,
            payer_phone: newTx.payerPhone || null,
            expires_at: newTx.expiresAt,
          })
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id;
        }
      } catch (err) {
        console.warn('Error guardando transacción en Supabase:', err);
      }
    }

    const all = this.getLocalTransactions();
    this.saveLocalTransactions([newTx, ...all]);

    return newTx;
  }

  /**
   * Consulta el estado de una transacción.
   */
  async getTransactionStatus(transactionNumber: string): Promise<BanecoTransaction | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('baneco_transactions')
          .select('*')
          .eq('transaction_number', transactionNumber)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            transactionNumber: data.transaction_number,
            obituaryId: data.obituary_id,
            planId: data.plan_id,
            amountBob: Number(data.amount_bob),
            amountUsd: Number(data.amount_usd),
            paymentMethod: data.payment_method,
            status: data.status,
            destinationAccount: BANECO_CONFIG.account,
            qrPayload: data.qr_payload,
            qrImageUrl: data.qr_image_url,
            payerName: data.payer_name,
            payerEmail: data.payer_email,
            payerPhone: data.payer_phone,
            bankAuthorizationCode: data.bank_authorization_code,
            banecoTransactionId: data.baneco_transaction_id,
            expiresAt: data.expires_at,
            paidAt: data.paid_at,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Error consultando estado en Supabase:', err);
      }
    }

    const all = this.getLocalTransactions();
    return all.find((t) => t.transactionNumber === transactionNumber || t.id === transactionNumber) || null;
  }

  /**
   * Simula la aprobación inmediata del cobro en modo pruebas/sandbox.
   */
  async simulatePaymentApproval(transactionNumber: string): Promise<BanecoTransaction | null> {
    const authCode = 'BNE-' + Math.floor(100000 + Math.random() * 900000);
    const paidAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('baneco_transactions')
          .update({
            status: 'completed',
            bank_authorization_code: authCode,
            paid_at: paidAt,
            updated_at: paidAt,
          })
          .eq('transaction_number', transactionNumber);
      } catch (err) {
        console.warn('Error simulando en Supabase:', err);
      }
    }

    const all = this.getLocalTransactions();
    let updatedTx: BanecoTransaction | null = null;
    const updatedList = all.map((tx) => {
      if (tx.transactionNumber === transactionNumber) {
        updatedTx = {
          ...tx,
          status: 'completed' as const,
          bankAuthorizationCode: authCode,
          paidAt,
        };
        return updatedTx;
      }
      return tx;
    });

    this.saveLocalTransactions(updatedList);
    return updatedTx;
  }
}

export const banecoPaymentService = new BanecoPaymentService();
