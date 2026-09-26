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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo solemne */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#F3ECE0] border border-[#E2D5C3] flex items-center justify-center text-[#C29837] shadow-sm transition-transform group-hover:scale-105">
            <Flame className="w-5 h-5 animate-flame" />
          </div>
          <div>
            <span className="font-memorial text-xl tracking-wider text-[#2D2926] font-semibold block leading-tight">
              Hobituario
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#8C847A] font-sans block">
              Memoriales Eternos
            </span>
          </div>
        </Link>

        {/* Enlaces de navegación */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/planes"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#655E57] hover:text-[#2D2926] hover:bg-[#F2ECE1] transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-[#C29837]" />
            <span>Membresías</span>
          </Link>

          {/* Estado de Autenticación según Rol del Usuario */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === 'super_admin' ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] transition-colors shadow-xs"
                  title="Panel Maestro de la Plataforma"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Super Admin</span>
                </Link>
              ) : currentUser.memorialSlug ? (
                <Link
                  href={`/memorial/${currentUser.memorialSlug}/admin`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3E3] text-[#C29837] border border-[#E8D7B0] hover:bg-[#F3ECE0] transition-colors shadow-xs"
                  title="Gestionar mi Memorial"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mi Panel</span>
                </Link>
              ) : null}

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-[#8C847A] hover:text-[#9E4232] hover:bg-[#FBEBE8] transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#8C6B32] text-white hover:bg-[#785924] transition-all shadow-sm cursor-pointer"
              title="Iniciar Sesión"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C29837]" />
              <span>Ingresar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
