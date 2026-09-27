import { NextResponse } from 'next/server';
import { banecoPaymentService } from '../../../../../services/banecoPaymentService';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Estructura habitual de IPN / Webhook de pasarelas bancarias bolivianas (Baneco)
    // { transactionId: 'BNE-123', status: 'COMPLETED', authorizationCode: '123456', amount: 341.00 }
    const transactionNumber = payload.transactionNumber || payload.transactionId || payload.orderId;
    const isSuccess = payload.status === 'COMPLETED' || payload.status === 'SUCCESS' || payload.code === '00';

    if (!transactionNumber) {
      return NextResponse.json({ error: 'Falta identificador de transacción' }, { status: 400 });
    }

    if (isSuccess) {
      await banecoPaymentService.simulatePaymentApproval(transactionNumber);
    }

    return NextResponse.json({
      received: true,
      message: 'Notificación procesada correctamente por Hobituario',
    });
  } catch (error: any) {
    console.error('Error procesando webhook de Baneco:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno en webhook' },
      { status: 500 }
    );
  }
}
