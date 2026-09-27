/**
 * Tipos y DTOs para la integración con Banco Económico (API Market v1.3.0)
 */

export interface BanecoConfig {
  baseUrl: string;
  username: string;
  password: string;
  aesKey: string;
  account: string;
  timeout: number; // en segundos
}

export interface GenerateQRParams {
  transactionId: string;
  amount: number;
  currency?: string; // Default: 'BOB'
  description?: string;
  dueDate?: string; // Formato yyyyMMdd o ISO
  singleUse?: boolean;
  modifyAmount?: boolean;
  branchCode?: string;
}

export interface GenerateQRResult {
  responseCode: number;
  message?: string;
  qrId: string;
  qrImage: string; // Base64 o URL
  qrPayload?: string;
  transactionId: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface StatusQRResult {
  responseCode: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'UNKNOWN';
  rawStatus?: number | string;
  qrId: string;
  amount?: number;
  paymentDate?: string;
  paymentTime?: string;
}

export interface WebhookPaymentPayload {
  qrId: string;
  transactionId: string;
  paymentDate: string;
  paymentTime: string;
  currency: string;
  amount: number | string;
  voucherNumber?: string;
}

export interface CheckoutRequest {
  orderId?: string;
  planId?: string;
  planName?: string;
  amount: number;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  obituaryId?: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  qrId: string;
  qrImage: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  status: 'PENDING' | 'CONFIRMED';
  message?: string;
}
