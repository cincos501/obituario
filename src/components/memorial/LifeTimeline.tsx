'use client';

import React from 'react';
import { TimelineMilestone } from '../../types/memorial';
import { History } from 'lucide-react';

interface Props {
  milestones: TimelineMilestone[];
}

export const LifeTimeline = ({ milestones }: Props) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <section className="my-16 max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9E9488] mb-2">
          <History className="w-3.5 h-3.5 text-[#C29837]" />
          <span>Cronología</span>
        </div>
        <h2 className="font-memorial text-2xl sm:text-3xl text-[#2D2926]">
          Momentos que Dejaron Huella
        </h2>
      </div>

      <div className="relative border-l-2 border-[#E5DDD0] ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8">
        {milestones.map((m) => (
          <div key={m.id} className="relative group">
            {/* Nodo de la línea de tiempo */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-[#FAF7F2] border-2 border-[#C29837] flex items-center justify-center text-[#C29837] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#C29837]" />
            </div>

            <div className="bg-[#FFFFFF] border border-[#EAE4D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F5EFE6] text-[#7A6126] font-semibold text-xs mb-2">
                {m.year}
              </span>
              <h3 className="font-memorial text-base sm:text-lg font-semibold text-[#2D2926] mb-1.5">
                {m.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C554D] leading-relaxed mb-3">
                {m.description}
              </p>

              {/* Fotografía histórica del momento */}
              {m.photoUrl && (
                <div className="rounded-xl overflow-hidden border border-[#E8DEC9] shadow-xs max-w-sm mt-2">
                  <img
                    src={m.photoUrl}
                    alt={m.title}
                    className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
