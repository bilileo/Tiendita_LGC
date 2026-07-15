import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css'; // Asegúrate de tener tus estilos globales de Tailwind aquí

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiendita Iglesia', // Reemplaza tu @ViewData["Title"]
  description: 'Sistema de gestión para la Tiendita LGC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full bg-slate-50">
      <head>
        {/* Esto es lo que le dice al celular que se comporte como responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-full text-slate-900 antialiased`}>
        
        {/* NAV BAR GLOBAL (Equivalente a tu navbar bg-dark) */}
        <nav className="bg-[#2f3542] text-white shadow-md">
          <div className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center flex-wrap gap-4">
            
            {/* LOGO + NOMBRE */}
            <Link href="/" className="flex items-center gap-2 font-semibold text-xl hover:opacity-90 transition-opacity">
              {/* Si tienes el logo en tu carpeta public/img/logo.png, descomenta la siguiente línea: */}
              {/* <img src="/img/logo.png" alt="Logo Tiendita LGC" className="h-9 w-9 rounded-md object-cover" /> */}
              <span className="tracking-wide">Tiendita LGC</span>
            </Link>

            {/* BOTONES DE NAVEGACIÓN (Tabs) */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
              <Link href="/" className="hover:bg-white/10 text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-all">
                Dashboard
              </Link>
              <Link href="/deudas" className="hover:bg-white/10 text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-all">
                Deudores
              </Link>
              <Link href="/notas" className="hover:bg-white/10 text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-all">
                Notas
              </Link>
            </div>

          </div>
        </nav>

        {/* CONTENIDO PRINCIPAL (Equivalente a tu @RenderBody) */}
        <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        {/* FOOTER GLOBAL */}
        <footer className="text-center py-5 border-t border-gray-200 text-gray-400 text-sm mt-auto bg-white">
          <div className="container mx-auto px-4 space-y-1">
            <p className="font-medium">Made by Bili ®</p>
            <p>LGC Derechos Reservados 2026</p>
          </div>
        </footer>

      </body>
    </html>
  );
}