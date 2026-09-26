import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { memorialService } from '../../../services/memorialService';
import { MemorialView } from '../../../components/memorial/MemorialView';
import { Navbar } from '../../../components/common/Navbar';
import { InstallPwaBanner } from '../../../components/common/InstallPwaBanner';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const memorial = await memorialService.getBySlug(slug);

  if (!memorial) {
    return {
      title: 'Memorial no encontrado | Hobituario',
    };
  }

  return {
    title: `En Memoria de ${memorial.fullName} | Hobituario`,
    description: memorial.epitaph || `Obituario y memorial de ${memorial.fullName}. Enciende una vela y acompáñanos.`,
    openGraph: {
      title: `En Memoria de ${memorial.fullName}`,
      description: memorial.epitaph,
      images: [memorial.mainPhotoUrl],
    },
  };
}

export default async function MemorialPage({ params }: PageProps) {
  const { slug } = await params;
  const memorial = await memorialService.getBySlug(slug);

  if (!memorial) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MemorialView initialObituary={memorial} />
      </main>
      <InstallPwaBanner />
    </>
  );
}
