import { NextResponse } from 'next/server';
import { banecoPaymentService } from '../../../../../../services/banecoPaymentService';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'ID de transacción no proporcionado' }, { status: 400 });
    }

    const transaction = await banecoPaymentService.getTransactionStatus(id);

    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error('Error consultando estado de transacción Baneco:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al consultar estado' },
      { status: 500 }
    );
  }
}

// Permitir simulación vía POST a este endpoint
export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    const updated = await banecoPaymentService.simulatePaymentApproval(id);

    return NextResponse.json({
      success: true,
      transaction: updated,
      message: 'Transacción aprobada satisfactoriamente en modo pruebas/sandbox.',
    });
  } catch (error: any) {
    console.error('Error simulando aprobación Baneco:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al simular aprobación' },
      { status: 500 }
    );
  }
}
