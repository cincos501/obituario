'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  biography: string;
  fullName: string;
}

export const MemorialBio = ({ biography, fullName }: Props) => {
  if (!biography) return null;

  return (
    <section className="my-12 max-w-3xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9E9488] mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#C29837]" />
          <span>Historia de Vida</span>
        </div>
        <h2 className="font-memorial text-2xl sm:text-3xl text-[#2D2926]">
          El Legado de {fullName}
        </h2>
      </div>

      <div className="bg-[#FFFFFF] border border-[#EAE4D8] rounded-3xl p-6 sm:p-10 shadow-sm relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF7F2] border border-[#E2D6C5] rounded-full px-4 py-1 text-[11px] font-script text-[#8A7F73]">
          En memoria eterna
        </div>

        <div className="text-[#4A4540] font-sans leading-relaxed text-sm sm:text-base space-y-4">
          {biography.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-3xl first-letter:font-memorial first-letter:font-semibold first-letter:text-[#C29837] first-letter:mr-1">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
