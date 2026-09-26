import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Obituary } from '../types/memorial';

export class PdfService {
  /**
   * Genera y descarga una tarjeta conmemorativa en PDF con el código QR listo para imprimir
   */
  async generateMemorialCardPdf(obituary: Obituary, memorialUrl: string): Promise<void> {
    // Generar código QR de alta resolución en Base64
    const qrDataUrl = await QRCode.toDataURL(memorialUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#2D2926',
        light: '#FFFFFF',
      },
    });

    // Crear documento PDF formato tarjeta (A6: 105 x 148 mm vertical)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fondo suave crema/marfil
    doc.setFillColor(251, 249, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Marco exterior solemne
    doc.setDrawColor(216, 202, 190);
    doc.setLineWidth(0.8);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Marco interior fino
    doc.setDrawColor(194, 152, 55);
    doc.setLineWidth(0.3);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

    // Encabezado
    doc.setTextColor(194, 152, 55);
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('En Memoria Eterna', pageWidth / 2, 16, { align: 'center' });

    // Símbolo de respeto
    doc.setDrawColor(194, 152, 55);
    doc.line(pageWidth / 2 - 12, 19, pageWidth / 2 + 12, 19);

    // Nombre del ser amado
    doc.setTextColor(45, 41, 38);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);

    // Dividir nombre si es muy largo
    const splitName = doc.splitTextToSize(obituary.fullName, pageWidth - 20);
    doc.text(splitName, pageWidth / 2, 26, { align: 'center' });

    // Fechas de vida
    const birthYear = new Date(obituary.birthDate).getFullYear() || obituary.birthDate;
    const deathYear = new Date(obituary.deathDate).getFullYear() || obituary.deathDate;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(115, 107, 99);
    doc.text(`${birthYear} — ${deathYear}`, pageWidth / 2, 33, { align: 'center' });

    // Epitafio
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 69, 64);
    const splitEpitaph = doc.splitTextToSize(obituary.epitaph, pageWidth - 24);
    doc.text(splitEpitaph, pageWidth / 2, 41, { align: 'center' });

    // Agregar el Código QR en el centro
    const qrSize = 48; // mm
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 56;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Borde suave alrededor del QR
    doc.setDrawColor(230, 222, 210);
    doc.setLineWidth(0.4);
    doc.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2);

    // Instrucción para los visitantes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 93, 85);
    doc.text('Escanea este código con tu celular', pageWidth / 2, 110, { align: 'center' });
    doc.text('para encender una vela virtual y visitar el memorial.', pageWidth / 2, 114, { align: 'center' });

    // Pie de página
    doc.setFont('times', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(166, 157, 146);
    doc.text('Hobituario • Santuario Digital de Paz y Memoria', pageWidth / 2, 138, { align: 'center' });

    // Descargar PDF
    const filename = `Tarjeta-Memorial-${obituary.slug}.pdf`;
    doc.save(filename);
  }
}

export const pdfService = new PdfService();
