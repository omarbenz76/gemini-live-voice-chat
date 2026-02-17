
import React, { useEffect, useRef } from 'react';
import { TranscriptionItem } from '../types';

interface TranscriptionListProps {
  transcriptions: TranscriptionItem[];
}

const TranscriptionList: React.FC<TranscriptionListProps> = ({ transcriptions }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  if (transcriptions.length === 0) return null;

  return (
    <div 
      ref={scrollRef}
      className="w-full max-w-lg h-48 mt-8 overflow-y-auto px-4 scroll-smooth mask-gradient"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
      }}
    >
      <div className="flex flex-col gap-6 py-8">
        {transcriptions.map((t, i) => (
          <div 
            key={`${t.timestamp}-${i}`} 
            className={`flex flex-col ${t.type === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">
              {t.type === 'user' ? 'You' : 'Gemini'}
            </span>
            <p className={`text-sm leading-relaxed max-w-[85%] ${t.type === 'user' ? 'text-right font-medium' : 'text-left font-light'}`}>
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptionList;
