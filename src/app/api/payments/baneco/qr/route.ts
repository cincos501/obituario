import { NextResponse } from 'next/server';
import { banecoPaymentService } from '../../../../../services/banecoPaymentService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, planName, payerName, payerEmail, payerPhone, obituaryId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId es requerido' }, { status: 400 });
    }

    const transaction = await banecoPaymentService.createQrOrder({
      planId,
      planName: planName || 'Plan Hobituario',
      payerName,
      payerEmail,
      payerPhone,
      obituaryId,
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error('Error en API Baneco QR:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar el cobro QR con Banco Económico' },
      { status: 500 }
    );
  }
}
