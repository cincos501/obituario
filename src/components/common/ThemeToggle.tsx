'use client';

import React, { useEffect } from 'react';

// Modo unificado y solemne base: no se requiere cambio de tema para evitar incompatibilidades de contraste.
export const ThemeToggle = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('hobituario_theme');
    }
  }, []);

  return null;
};
