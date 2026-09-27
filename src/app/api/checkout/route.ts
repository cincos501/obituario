import { NextResponse } from 'next/server';
import { banecoService } from '@/lib/baneco/service';
import { CheckoutRequest, CheckoutResponse } from '@/lib/baneco/types';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

// Almacén en memoria para desarrollo local / fallback de idempotencia y persistencia rápida
const memoryTransactions = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const body: CheckoutRequest = await req.json();

    const amount = Number(body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'El monto es requerido y debe ser mayor a 0.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = body.orderId || `ORD-${timestamp}-${randomSuffix}`;
    const transactionId = `BNE-${timestamp}-${randomSuffix}`;

    // 1. Generar código QR con Banco Económico
    const qrResult = await banecoService.generateQR({
      transactionId,
      amount,
      currency: 'BOB',
      description: body.description || (body.planName ? `Hobituario ${body.planName}` : `Pedido #${orderId}`),
      singleUse: true,
      modifyAmount: false,
    });

    const expiresAt = new Date(timestamp + 24 * 60 * 60 * 1000).toISOString();

    const txRecord = {
      orderId,
      transactionNumber: transactionId,
      qrId: qrResult.qrId,
      qrImage: qrResult.qrImage,
      qrPayload: qrResult.qrPayload,
      planId: body.planId || 'esencial',
      planName: body.planName || 'Plan Esencial',
      amountBob: amount,
      currency: 'BOB',
      status: 'PENDING',
      payerName: body.payerName || 'Cliente Particular',
      payerEmail: body.payerEmail || null,
      payerPhone: body.payerPhone || null,
      obituaryId: body.obituaryId || null,
      items: body.items || [],
      description: body.description || `Membresía ${body.planName || 'Hobituario'}`,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    // 2. Guardar en memoria
    memoryTransactions.set(qrResult.qrId, txRecord);
    memoryTransactions.set(transactionId, txRecord);

    // 3. Guardar en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('baneco_transactions').insert({
          transaction_number: transactionId,
          obituary_id: body.obituaryId || null,
          plan_id: body.planId || 'esencial',
          amount_bob: amount,
          amount_usd: Number((amount / 6.96).toFixed(2)),
          payment_method: 'qr_simple',
          status: 'pending',
          destination_account: process.env.BANECO_ACCOUNT || '6111329426',
          qr_payload: qrResult.qrPayload,
          qr_image_url: qrResult.qrImage,
          payer_name: txRecord.payerName,
          payer_email: txRecord.payerEmail,
          payer_phone: txRecord.payerPhone,
          expires_at: expiresAt,
        });
      } catch (dbErr) {
        console.warn('Checkout: Advertencia al guardar en Supabase (usando memoria):', dbErr);
      }
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
    const paymentUrl = `${appUrl}/payments/${qrResult.qrId}`;

    const responseData: CheckoutResponse = {
      success: true,
      orderId,
      qrId: qrResult.qrId,
      qrImage: qrResult.qrImage,
      amount,
      currency: 'BOB',
      paymentUrl,
      status: 'PENDING',
      message: 'Orden creada exitosamente. Esperando acreditación.',
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/checkout:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Error interno al procesar el checkout con Baneco.',
      },
      { status: 500 }
    );
  }
}

// Exportar helper para compartir datos en memoria entre endpoints del mismo runtime
export function getMemoryTransaction(key: string) {
  return memoryTransactions.get(key);
}

export function updateMemoryTransaction(key: string, updates: Record<string, any>) {
  const existing = memoryTransactions.get(key);
  if (existing) {
    const updated = { ...existing, ...updates };
    memoryTransactions.set(key, updated);
    if (existing.qrId) memoryTransactions.set(existing.qrId, updated);
    if (existing.transactionNumber) memoryTransactions.set(existing.transactionNumber, updated);
    return updated;
  }
  return null;
}
