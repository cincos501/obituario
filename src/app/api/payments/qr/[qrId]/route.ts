import { NextResponse } from 'next/server';
import { banecoService } from '@/lib/baneco/service';
import { getMemoryTransaction, updateMemoryTransaction } from '@/app/api/checkout/route';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    if (!qrId) {
      return NextResponse.json({ success: false, message: 'Falta parámetro qrId' }, { status: 400 });
    }

    let orderData = getMemoryTransaction(qrId);

    // Si no está en memoria, consultar en Supabase
    if (!orderData && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('baneco_transactions')
          .select('*')
          .or(`qr_payload.ilike.%${qrId}%,transaction_number.eq.${qrId}`)
          .maybeSingle();

        if (!error && data) {
          orderData = {
            orderId: data.transaction_number,
            transactionNumber: data.transaction_number,
            qrId,
            qrImage: data.qr_image_url,
            planId: data.plan_id,
            planName: data.plan_id === 'esencial' ? 'Plan Memoria Esencial' : data.plan_id === 'legado' ? 'Plan Homenaje Legado' : 'Plan Legado Infinito',
            amountBob: Number(data.amount_bob),
            currency: 'BOB',
            status: data.status === 'completed' ? 'CONFIRMED' : data.status === 'expired' ? 'EXPIRED' : 'PENDING',
            payerName: data.payer_name,
            payerEmail: data.payer_email,
            payerPhone: data.payer_phone,
            obituaryId: data.obituary_id,
            createdAt: data.created_at,
            paidAt: data.paid_at,
          };
        }
      } catch (dbErr) {
        console.warn('Error consultando Supabase en /api/payments/qr/[qrId]:', dbErr);
      }
    }

    // Si aún no existe información, crear registro provisional con monto por defecto
    if (!orderData) {
      orderData = {
        orderId: qrId,
        transactionNumber: qrId,
        qrId,
        amountBob: 341.00,
        currency: 'BOB',
        status: 'PENDING',
        payerName: 'Familiar Titular',
        planName: 'Plan Homenaje Legado',
        createdAt: new Date().toISOString(),
      };
    }

    // Si el estado sigue en 'PENDING', ejecutar verificación de fallback contra la API de Baneco
    if (orderData.status === 'PENDING') {
      try {
        const statusResult = await banecoService.checkQRStatus(qrId);

        if (statusResult.status === 'CONFIRMED') {
          const now = new Date().toISOString();
          orderData.status = 'CONFIRMED';
          orderData.paidAt = now;

          // Actualizar memoria
          updateMemoryTransaction(qrId, { status: 'CONFIRMED', paidAt: now });

          // Actualizar base de datos Supabase
          if (isSupabaseConfigured && supabase) {
            await supabase
              .from('baneco_transactions')
              .update({
                status: 'completed',
                paid_at: now,
                bank_authorization_code: statusResult.rawStatus?.toString() || 'BNE-OK',
              })
              .or(`qr_payload.ilike.%${qrId}%,transaction_number.eq.${qrId}`);
          }
        } else if (statusResult.status === 'EXPIRED') {
          orderData.status = 'EXPIRED';
          updateMemoryTransaction(qrId, { status: 'EXPIRED' });
        }
      } catch (checkErr) {
        console.warn('Fallo no bloqueante al verificar status contra Baneco:', checkErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: orderData.status,
      order: {
        orderId: orderData.orderId,
        transactionNumber: orderData.transactionNumber,
        qrId: orderData.qrId,
        amount: orderData.amountBob,
        currency: orderData.currency || 'BOB',
        planName: orderData.planName || 'Membresía Digital',
        payerName: orderData.payerName || 'Cliente',
        payerEmail: orderData.payerEmail,
        payerPhone: orderData.payerPhone,
        description: orderData.description,
        createdAt: orderData.createdAt,
        paidAt: orderData.paidAt,
      },
      qrImage: orderData.qrImage,
    });
  } catch (error: any) {
    console.error('Error en GET /api/payments/qr/[qrId]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Error al obtener estado de pago.' },
      { status: 500 }
    );
  }
}
