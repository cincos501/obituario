'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Tag, LogIn, LogOut, Heart } from 'lucide-react';
import { authService, AuthUser } from '../../services/authService';

export const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EAE4D8] transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo solemne */}
        <Link href="/" className="flex items-center gap-2 group shrink min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F3ECE0] border border-[#E2D5C3] flex items-center justify-center text-[#C29837] shadow-sm transition-transform group-hover:scale-105 shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-flame" />
          </div>
          <div className="min-w-0">
            <span className="font-memorial text-lg sm:text-xl tracking-wider text-[#2D2926] font-semibold block leading-tight truncate">
              Hobituario
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#8C847A] font-sans hidden sm:block">
              Memoriales Eternos
            </span>
          </div>
        </Link>

        {/* Enlaces de navegación */}
        <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href="/planes"
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium text-[#655E57] hover:text-[#2D2926] hover:bg-[#F2ECE1] transition-colors shrink-0"
          >
            <Tag className="w-3.5 h-3.5 text-[#C29837]" />
            <span className="hidden sm:inline">Membresías</span>
            <span className="sm:hidden">Planes</span>
          </Link>

          {/* Estado de Autenticación según Rol del Usuario */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {currentUser.role === 'super_admin' ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] transition-colors shadow-xs shrink-0"
                  title="Panel Maestro de la Plataforma"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Super Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              ) : currentUser.memorialSlug ? (
                <Link
                  href={`/memorial/${currentUser.memorialSlug}/admin`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] transition-colors shadow-xs shrink-0"
                  title="Gestionar mi Memorial"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mi Panel</span>
                  <span className="sm:hidden">Panel</span>
                </Link>
              ) : null}

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-[#8C847A] hover:text-[#9E4232] hover:bg-[#FBEBE8] transition-colors cursor-pointer shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-[#8C6B32] text-white hover:bg-[#785924] transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
              title="Iniciar Sesión"
            >
              <LogIn className="w-3.5 h-3.5 text-[#F5C354]" />
              <span>Ingresar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
