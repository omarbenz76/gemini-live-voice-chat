
import React from 'react';
import { ConnectionStatus } from '../types';

interface ChatControlsProps {
  status: ConnectionStatus;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({ status, onStart, onStop, onOpenSettings }) => {
  const isConnected = status === ConnectionStatus.CONNECTED;
  const isConnecting = status === ConnectionStatus.CONNECTING;

  return (
    <div className="fixed bottom-12 left-0 w-full flex justify-center z-50 px-4">
      <div className="bg-white/80 backdrop-blur-md border border-black/5 shadow-lg rounded-full px-6 py-4 flex items-center gap-6 max-w-full">
        {isConnected ? (
          <button
            onClick={onStop}
            className="flex items-center gap-3 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all active:scale-95 group"
          >
            <div className="w-2 h-2 rounded-sm bg-red-500 animate-pulse group-hover:scale-125 transition-transform"></div>
            <span className="font-medium">End Session</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={isConnecting}
            className={`flex items-center gap-3 bg-black text-white px-8 py-3 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="font-medium">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <span className="font-medium whitespace-nowrap">Start Talking</span>
              </>
            )}
          </button>
        )}
        
        <div className="w-px h-6 bg-black/10 mx-2"></div>
        
        <div className="flex items-center gap-4 text-gray-500">
          <button 
            onClick={onOpenSettings}
            title="Settings" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatControls;
