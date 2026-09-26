'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../components/common/Navbar';
import { authService, AuthUser } from '../../services/authService';
import { Flame, Lock, Mail, ShieldCheck, Heart, ArrowRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleRedirect = (user: AuthUser) => {
    if (redirectParam) {
      router.push(redirectParam);
      return;
    }
    if (user.role === 'super_admin') {
      router.push('/admin');
    } else if (user.role === 'family_owner' && user.memorialSlug) {
      router.push(`/memorial/${user.memorialSlug}/admin`);
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await authService.login(identifier, password);
    setIsLoading(false);

    if (result.success && result.user) {
      handleRedirect(result.user);
    } else {
      setError(result.error || 'Credenciales no válidas.');
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'esencial' | 'legado' | 'infinito') => {
    setIsLoading(true);
    setError(null);
    let id = '';
    let pass = '';

    if (type === 'admin') {
      id = 'admin@hobituario.com';
      pass = 'admin123';
    } else if (type === 'esencial') {
      id = 'esencial@hobituario.com';
      pass = 'esencial123';
    } else if (type === 'legado') {
      id = 'legado@hobituario.com';
      pass = 'legado123';
    } else if (type === 'infinito') {
      id = 'infinito@hobituario.com';
      pass = 'infinito123';
    }

    setIdentifier(id);
    setPassword(pass);

    const result = await authService.login(id, pass);
    setIsLoading(false);

    if (result.success && result.user) {
      handleRedirect(result.user);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#F3ECE0] border border-[#E2D5C3] flex items-center justify-center text-[#C29837] shadow-sm mx-auto mb-4">
          <Flame className="w-7 h-7 animate-flame" />
        </div>
        <h1 className="font-memorial text-2xl sm:text-3xl text-[#2D2926] font-semibold mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-xs text-[#7A7167]">
          Accede a tu panel de administración según tus permisos y facultades asignadas.
        </p>
      </div>

      {currentUser ? (
        <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E3] text-[#C29837] text-xs font-semibold">
            {currentUser.role === 'super_admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sesión activa como Super Admin</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                <span>Sesión activa como Familiar Titular</span>
              </>
            )}
          </div>
          <p className="text-sm font-semibold text-[#2D2926]">{currentUser.name}</p>
          <p className="text-xs text-[#8C847A]">{currentUser.email}</p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleRedirect(currentUser)}
              className="w-full py-2.5 rounded-full bg-[#2D2926] text-white text-xs font-semibold hover:bg-[#433E3A] transition-colors flex items-center justify-center gap-2"
            >
              <span>Ir a mi Panel de Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-full border border-[#D8CABE] text-[#7A7167] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EAE4D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FBEBE8] border border-[#ECD1CC] text-[#9E4232] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C29837]" />
                <span>Correo Electrónico o Código de Memorial</span>
              </label>
              <input
                type="text"
                required
                placeholder="ej. admin@hobituario.com o familia@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D46] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C29837]" />
                <span>Contraseña o PIN de Acceso</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CABE] bg-[#FAF7F2] text-xs sm:text-sm text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#C29837]/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#2D2926] text-white text-xs sm:text-sm font-semibold hover:bg-[#433E3A] transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Comprobando credenciales...' : 'Entrar a mi Panel'}
            </button>
          </form>

          {/* Accesos de Prueba Rápidos */}
          <div className="pt-4 border-t border-[#F2ECE1] space-y-2.5">
            <p className="text-[11px] font-semibold text-[#8C847A] uppercase tracking-wider text-center">
              Accesos de Prueba por Membresía (1 Clic)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('esencial')}
                className="p-3 rounded-2xl border border-[#D8CABE] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-left transition-all cursor-pointer group hover:border-[#C29837]"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAE2D5] text-[#544D46]">
                    Plan Esencial ($19)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2926]">
                  <Heart className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Don Antonio Roca</span>
                </div>
                <p className="text-[10px] text-[#7A7167] mt-0.5">5 fotos • 3 ceremonias • 10 hitos</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('legado')}
                className="p-3 rounded-2xl border border-[#C29837]/60 bg-[#FFFDF9] hover:bg-[#FAF3E3] text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0]">
                    Plan Legado ($49) ★
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2926]">
                  <Flame className="w-3.5 h-3.5 text-[#C29837] animate-flame" />
                  <span>Dr. Carlos Mendoza</span>
                </div>
                <p className="text-[10px] text-[#7A7167] mt-0.5">Fotos ilimitadas • Biografía • Velas</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('infinito')}
                className="p-3 rounded-2xl border border-[#D8CABE] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-left transition-all cursor-pointer group hover:border-[#C29837]"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2D2926] text-white">
                    Plan Infinito ($99)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2926]">
                  <Heart className="w-3.5 h-3.5 text-[#9E4232]" />
                  <span>Dra. Beatriz Valdivia</span>
                </div>
                <p className="text-[10px] text-[#7A7167] mt-0.5">Todo ilimitado • Livestream • PWA</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-3 rounded-2xl border border-[#D8CABE] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-left transition-all cursor-pointer group hover:border-[#C29837]"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF3E3] text-[#C29837]">
                    Super Admin
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2926]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C29837]" />
                  <span>Dueño Plataforma</span>
                </div>
                <p className="text-[10px] text-[#7A7167] mt-0.5">Gestión de todos los memoriales</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-[#8C847A]">
        <Link href="/" className="hover:text-[#2D2926] transition-colors underline">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2D2926] flex flex-col selection:bg-[#E8DED1]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-8 text-center text-xs">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
