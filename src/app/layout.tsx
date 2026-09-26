import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#F5EFE6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hobituario | Memoriales y Recuerdos Eternos",
  description: "Espacio solemne y respetuoso para honrar la vida de nuestros seres amados, encender velas virtuales, compartir condolencias e información de servicios funerarios.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hobituario",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FBF9F5] text-[#2D2926] selection:bg-[#E8DED1] selection:text-[#2D2926]">
        {children}
      </body>
    </html>
  );
}
