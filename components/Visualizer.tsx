
import React from 'react';

interface VisualizerProps {
  volume: number;
  isListening: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isListening }) => {
  // Base scale + dynamic volume scaling
  const scale = 1 + volume * 0.8;
  const pulseScale = isListening ? 1 + Math.sin(Date.now() / 1000) * 0.05 : 1;
  
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Tertiary Color: Purple glow layers */}
      <div 
        className="absolute w-full h-full rounded-full bg-purple-200 blur-3xl opacity-20 transition-transform duration-75 ease-out"
        style={{ transform: `scale(${scale * 1.5})` }}
      />
      <div 
        className="absolute w-full h-full rounded-full bg-purple-400 blur-2xl opacity-10 transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale * 1.2})` }}
      />
      
      {/* Outer black ring */}
      <div 
        className="absolute w-48 h-48 border-[0.5px] border-black/10 rounded-full transition-transform duration-150 ease-out"
        style={{ transform: `scale(${scale})` }}
      />

      {/* Main black/purple orb */}
      <div 
        className="relative w-40 h-40 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden border border-black/5"
        style={{ transform: `scale(${pulseScale})` }}
      >
        {/* Animated wave layers */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-black via-black to-purple-900 transition-opacity duration-1000"
          style={{ opacity: isListening ? 1 : 0.8 }}
        />
        
        {/* Moving highlights to simulate depth */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-[spin_8s_linear_infinite]" />
        
        {/* Core glow */}
        <div 
          className="absolute w-1/2 h-1/2 bg-purple-500/30 blur-xl rounded-full transition-all duration-100 ease-out"
          style={{ 
            transform: `scale(${1 + volume * 2})`,
            opacity: 0.4 + volume * 0.6
          }}
        />
      </div>

      {/* Voice ripple effects (only active when volume is present) */}
      {volume > 0.05 && (
        <>
          <div 
            className="absolute w-40 h-40 border border-purple-500 rounded-full animate-ping opacity-20"
            style={{ animationDuration: '2s' }}
          />
          <div 
            className="absolute w-40 h-40 border border-purple-300 rounded-full animate-ping opacity-10"
            style={{ animationDuration: '3s', animationDelay: '0.5s' }}
          />
        </>
      )}
    </div>
  );
};

export default Visualizer;
