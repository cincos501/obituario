import { NextResponse } from 'next/server';
import { updateMemoryTransaction } from '@/app/api/checkout/route';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

// Set de idempotencia para evitar procesar la misma transacción repetidas veces en 24h
const processedQrCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const qrId = String(payload.qrId || payload.qr_id || '').trim();
    const transactionId = String(payload.transactionId || payload.transaction_id || '').trim();
    const amount = payload.amount;
    const paymentDate = payload.paymentDate || new Date().toISOString().split('T')[0];
    const paymentTime = payload.paymentTime || new Date().toTimeString().split(' ')[0];

    console.log('Baneco Webhook: Notificación recibida para QR:', {
      qrId,
      transactionId,
      amount,
      paymentDate,
      paymentTime,
    });

    if (!qrId && !transactionId) {
      return NextResponse.json(
        { success: false, message: 'Identificador de transacción o QR requerido.' },
        { status: 400 }
      );
    }

    const key = qrId || transactionId;

    // 1. Verificación de Idempotencia: Si ya fue procesado en las últimas 24h, responder 200 inmediatamente
    const now = Date.now();
    const lastProcessed = processedQrCache.get(key);
    if (lastProcessed && now - lastProcessed < 24 * 60 * 60 * 1000) {
      console.log(`Baneco Webhook: Ignorando notificación duplicada para ${key} (Idempotente).`);
      return NextResponse.json({
        success: true,
        message: 'Notificación ya procesada anteriormente.',
      });
    }

    // 2. Registrar en caché de idempotencia
    processedQrCache.set(key, now);

    const paidAt = new Date().toISOString();

    // 3. Actualizar estado en memoria
    updateMemoryTransaction(key, {
      status: 'CONFIRMED',
      paidAt,
      paymentDate,
      paymentTime,
    });

    // 4. Actualizar en Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('baneco_transactions')
          .update({
            status: 'completed',
            paid_at: paidAt,
            bank_authorization_code: `BNE-${paymentDate.replace(/-/g, '')}-${paymentTime.replace(/:/g, '')}`,
          })
          .or(`qr_payload.ilike.%${key}%,transaction_number.eq.${transactionId || key}`);

        if (error) {
          console.warn('Baneco Webhook: Error actualizando Supabase:', error);
        } else {
          console.log(`Baneco Webhook: Transacción ${key} confirmada y actualizada en base de datos.`);
        }
      } catch (dbErr) {
        console.warn('Baneco Webhook: Excepción en base de datos:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación procesada y orden confirmada exitosamente.',
    });
  } catch (error: any) {
    console.error('Baneco Webhook: Error fatal procesando webhook:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Error interno en webhook' },
      { status: 500 }
    );
  }
}
