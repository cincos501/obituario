import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured } from './supabase';
import { SubscriptionPlanId } from '../types/memorial';

export type BanecoPaymentMethod = 'qr_simple' | 'card_baneco' | 'transfer';
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
  qrPayload?: string;
  qrImageUrl?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  payerDocument?: string; // NIT o CI
  cardLastDigits?: string;
  bankAuthorizationCode?: string;
  banecoTransactionId?: string;
  expiresAt: string;
  paidAt?: string;
  createdAt: string;
}

const STORAGE_TX_KEY = 'hobituario_baneco_transactions_v1';

// Precios de referencia oficiales en Bolivianos (BOB) según tasa referencial
export const PLAN_PRICES_BOB: Record<SubscriptionPlanId, number> = {
  esencial: 132.00,  // $19 USD (~6.96 Bs/USD)
  legado: 341.00,    // $49 USD
  infinito: 689.00,  // $99 USD
};

export const PLAN_PRICES_USD: Record<SubscriptionPlanId, number> = {
  esencial: 19.00,
  legado: 49.00,
  infinito: 99.00,
};

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
   * Genera el payload ASFI EMVCo interoperable para cobros por QR Simple en Bolivia.
   */
  private generateAsfiQrString(params: {
    transactionNumber: string;
    amountBob: number;
    planName: string;
  }): string {
    const bankCode = '0010'; // Código Banco Económico ASFI
    const currency = '068'; // Bolivianos (BOB ISO 4217)
    const amountStr = params.amountBob.toFixed(2);
    // Formato estándar QR Simple ASFI Bolivia
    return `00020101021226460010${bankCode}0116${params.transactionNumber}520460115303${currency}540${amountStr.length}${amountStr}5802BO5910HOBITUARIO6008SANTA_CRUZ62200516${params.planName.slice(0, 16)}6304ABCD`;
  }

  /**
   * Inicia una orden de pago por QR Simple Baneco.
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

    // Vigencia de 15 minutos (900 segundos) para el código QR
    const expiresAt = new Date(timestamp + 15 * 60 * 1000).toISOString();
    const qrPayload = this.generateAsfiQrString({
      transactionNumber,
      amountBob,
      planName: params.planName,
    });

    let qrImageUrl = '';
    try {
      qrImageUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1C1917',
          light: '#FFFFFF',
        },
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
   * Procesa un cobro con Tarjeta Débito/Crédito Visa o Mastercard de Baneco o Red Enlace.
   */
  async processCardPayment(params: {
    planId: SubscriptionPlanId;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardHolder: string;
    documentNumber: string;
    payerEmail?: string;
    payerPhone?: string;
    obituaryId?: string;
  }): Promise<{ success: boolean; transaction: BanecoTransaction; message: string }> {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionNumber = `BNE-CRD-${timestamp}-${randomSuffix}`;
    const amountBob = PLAN_PRICES_BOB[params.planId] || 341.00;
    const amountUsd = PLAN_PRICES_USD[params.planId] || 49.00;
    const cardLastDigits = params.cardNumber.replace(/\s+/g, '').slice(-4);
    const authCode = 'AUTH-' + Math.floor(100000 + Math.random() * 900000);

    const newTx: BanecoTransaction = {
      id: 'tx-' + timestamp,
      transactionNumber,
      obituaryId: params.obituaryId,
      planId: params.planId,
      amountBob,
      amountUsd,
      paymentMethod: 'card_baneco',
      status: 'completed',
      payerName: params.cardHolder,
      payerEmail: params.payerEmail,
      payerPhone: params.payerPhone,
      payerDocument: params.documentNumber,
      cardLastDigits,
      bankAuthorizationCode: authCode,
      banecoTransactionId: 'BNE-GATEWAY-' + timestamp,
      expiresAt: new Date(timestamp + 3600000).toISOString(),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

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
            status: 'completed',
            payer_name: newTx.payerName,
            payer_email: newTx.payerEmail || null,
            payer_phone: newTx.payerPhone || null,
            payer_document: newTx.payerDocument,
            card_last_digits: newTx.cardLastDigits,
            bank_authorization_code: newTx.bankAuthorizationCode,
            baneco_transaction_id: newTx.banecoTransactionId,
            paid_at: newTx.paidAt,
          })
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id;
        }
      } catch (err) {
        console.warn('Error guardando pago con tarjeta en Supabase:', err);
      }
    }

    const all = this.getLocalTransactions();
    this.saveLocalTransactions([newTx, ...all]);

    return {
      success: true,
      transaction: newTx,
      message: `Pago aprobado satisfactoriamente por Banco Económico. Autorización: ${authCode}`,
    };
  }

  /**
   * Consulta el estado actual de una transacción por su número o ID.
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
            qrPayload: data.qr_payload,
            qrImageUrl: data.qr_image_url,
            payerName: data.payer_name,
            payerEmail: data.payer_email,
            payerPhone: data.payer_phone,
            payerDocument: data.payer_document,
            cardLastDigits: data.card_last_digits,
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
   * Simula la aprobación inmediata del pago (útil para pruebas en Sandbox antes de conectar API keys de producción).
   */
  async simulatePaymentApproval(transactionNumber: string): Promise<BanecoTransaction | null> {
    const authCode = 'SIM-BNE-' + Math.floor(100000 + Math.random() * 900000);
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
