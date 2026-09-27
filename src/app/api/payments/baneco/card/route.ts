import { NextResponse } from 'next/server';
import { banecoPaymentService } from '../../../../../services/banecoPaymentService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      planId, 
      cardNumber, 
      cardExpiry, 
      cardCvv, 
      cardHolder, 
      documentNumber, 
      payerEmail, 
      payerPhone, 
      obituaryId 
    } = body;

    if (!planId || !cardNumber || !cardExpiry || !cardCvv || !cardHolder || !documentNumber) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos de la tarjeta o del titular para procesar con Baneco' },
        { status: 400 }
      );
    }

    const result = await banecoPaymentService.processCardPayment({
      planId,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardHolder,
      documentNumber,
      payerEmail,
      payerPhone,
      obituaryId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en API Baneco Card:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la tarjeta con Banco Económico' },
      { status: 500 }
    );
  }
}
