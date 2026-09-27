'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { ShieldCheck, ArrowLeft, FileText, AlertTriangle, Cloud, Lock, HeartHandshake } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A7167] hover:text-[#2D2926] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Portada</span>
          </Link>
        </div>

        <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 pb-6 border-b border-[#F2ECE1]">
            <div className="w-12 h-12 rounded-full bg-[#FAF3E3] border border-[#E8D7B0] flex items-center justify-center text-[#C29837] mx-auto shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="font-memorial text-2xl sm:text-4xl text-[#2D2926]">
              Términos, Condiciones y Políticas de Servicio
            </h1>
            <p className="text-xs text-[#7A7167]">
              Última actualización: Septiembre de 2026 • Plataforma Hobituario Bolivia
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#544D46] leading-relaxed">
            
            {/* Cláusula 1: Naturaleza del Servicio */}
            <div className="space-y-2">
              <h2 className="font-memorial text-lg text-[#2D2926] font-semibold flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#C29837]" />
                <span>1. Objeto y Naturaleza del Servicio</span>
              </h2>
              <p>
                Hobituario proporciona una plataforma tecnológica para la creación, resguardo y difusión de memoriales digitales solemnes, facilitando la publicación de biografías, ceremonias fúnebres, líneas de vida y recepción de condolencias respetuosas de parte de familiares y allegados.
              </p>
            </div>

            {/* Cláusula 2: Responsabilidad sobre Pagos y Membresías */}
            <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE5DA]">
              <h2 className="font-memorial text-lg text-[#2D2926] font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8C6B32]" />
                <span>2. Pagos, Transacciones y Responsabilidad del Usuario</span>
              </h2>
              <p>
                El usuario o familiar titular es el único y exclusivo responsable de verificar el monto, la cuenta bancaria de destino (Banco Económico N° 6111329426) y los datos ingresados al momento de realizar la transferencia o escanear el código QR Simple ASFI.
              </p>
              <p className="text-[12px] text-[#7A7167]">
                Los pagos abonados por concepto de activación de planes (Plan Memoria Esencial, Plan Homenaje Legado o Plan Legado Infinito) cubren los costos inmediatos de aprovisionamiento de infraestructura digital y dominios, por lo que son definitivos una vez confirmados por el sistema bancario.
              </p>
            </div>

            {/* Cláusula 3: Deslinde de Responsabilidad sobre Almacenamiento en la Nube */}
            <div className="space-y-2 p-4 bg-[#FFFBF2] rounded-2xl border border-[#E8D7B0]">
              <h2 className="font-memorial text-lg text-[#8C6B32] font-semibold flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#C29837]" />
                <span>3. Preservación Digital e Infraestructura de Terceros</span>
              </h2>
              <p>
                Hobituario emplea servicios profesionales de infraestructura en la nube (incluyendo proveedores como Supabase Inc., Vercel Inc. y redes CDN mundiales) para almacenar bases de datos, fotografías y contenidos multimedia.
              </p>
              <p className="font-medium text-[#2D2926]">
                <strong>Exclusión de Responsabilidad por Proveedores Cloud:</strong> El usuario acepta expresamente que Hobituario no asume responsabilidad civil, contractual ni indemnizatoria en caso de que proveedores externos de alojamiento en la nube (como Supabase o similares) modifiquen sus términos de servicio, interrumpan el servicio por mantenimiento, eliminen, den de baja o pierdan imágenes, datos o archivos debido a fallas globales de servidores, fuerza mayor, catástrofes tecnológicas o cambios regulatorios ajenos al control directo de Hobituario.
              </p>
              <p className="text-[11px] text-[#7A7167]">
                Se recomienda encarecidamente a las familias conservar copias de seguridad personales de todas las fotografías y documentos históricos originales que decidan publicar.
              </p>
            </div>

            {/* Cláusula 4: Propiedad de los Contenidos y Moderación */}
            <div className="space-y-2">
              <h2 className="font-memorial text-lg text-[#2D2926] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4A634E]" />
                <span>4. Contenido Familiar y Moderación de Respeto</span>
              </h2>
              <p>
                Los titulares de cada memorial garantizan tener la legitimidad y consentimiento moral para difundir la historia y retrato del ser amado. Queda estrictamente prohibida la publicación de contenidos injuriosos, difamatorios, de odio o que contravengan la solemnidad del espacio.
              </p>
              <p>
                Hobituario provee herramientas de <strong>Moderación Familiar</strong> para que el titular apruebe o elimine previamente cada condolencia y vela virtual antes de su visualización pública.
              </p>
            </div>

            {/* Cláusula 5: Disponibilidad y Cancelación */}
            <div className="space-y-2">
              <h2 className="font-memorial text-lg text-[#2D2926] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#9E4232]" />
                <span>5. Modificaciones y Jurisdicción</span>
              </h2>
              <p>
                Hobituario se reserva la facultad de actualizar las presentes condiciones para adaptarlas a nuevas normativas comerciales o bancarias de Bolivia. Cualquier diferendo será resuelto conforme a la legislación civil aplicable del Estado Plurinacional de Bolivia.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-[#F2ECE1] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#2D2926] text-white text-xs font-semibold hover:bg-[#433E3A] transition-colors shadow-sm"
            >
              Comprendido y Aceptado
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
