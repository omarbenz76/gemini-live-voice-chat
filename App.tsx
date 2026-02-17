
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConnectionStatus, TranscriptionItem } from './types';
import Visualizer from './components/Visualizer';
import ChatControls from './components/ChatControls';
import TranscriptionList from './components/TranscriptionList';
import SettingsOverlay from './components/SettingsOverlay';

// Helper functions for audio encoding/decoding as required by the Live API docs
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', model: '' });

  const startSession = async () => {
    if (status === ConnectionStatus.CONNECTED) return;
    
    setErrorMessage(null);
    setStatus(ConnectionStatus.CONNECTING);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support microphone access.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (mediaError: any) {
        if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          throw new Error("Microphone not found. Please ensure a microphone is connected and enabled.");
        } else if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          throw new Error("Microphone permission denied. Please allow access to use voice chat.");
        } else {
          throw new Error(`Microphone error: ${mediaError.message || "Unknown error"}`);
        }
      }

      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a helpful, witty AI assistant named Kore. Keep responses conversational, balanced, and concise. You are speaking in real-time."
        },
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            setIsListening(true);
            
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5));

              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            }
            
            if (message.serverContent?.turnComplete) {
              const userText = transcriptionRef.current.user.trim();
              const modelText = transcriptionRef.current.model.trim();
              
              if (userText || modelText) {
                setTranscriptions(prev => [
                  ...prev,
                  ...(userText ? [{ type: 'user' as const, text: userText, timestamp: Date.now() }] : []),
                  ...(modelText ? [{ type: 'model' as const, text: modelText, timestamp: Date.now() }] : []),
                ]);
              }
              transcriptionRef.current = { user: '', model: '' };
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setStatus(ConnectionStatus.ERROR);
            setErrorMessage("Connection to Gemini failed. Please try again.");
          },
          onclose: () => {
            setStatus(ConnectionStatus.DISCONNECTED);
            setIsListening(false);
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus(ConnectionStatus.ERROR);
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    setStatus(ConnectionStatus.DISCONNECTED);
    setIsListening(false);
    setVolume(0);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white text-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-50 to-transparent pointer-events-none opacity-40"></div>
      
      <header className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <h1 className="text-xl font-light tracking-tight">Gemini <span className="font-semibold">Live</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500' : status === ConnectionStatus.CONNECTING ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            {status}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl flex flex-col items-center gap-12">
          <Visualizer volume={volume} isListening={isListening} />
          <div className="text-center transition-all duration-700 ease-in-out">
            {errorMessage ? (
              <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            ) : (
              <>
                <p className={`text-2xl font-light mb-2 ${isListening ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {status === ConnectionStatus.CONNECTED ? "I'm listening..." : "Ready to talk?"}
                </p>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  {status === ConnectionStatus.CONNECTED 
                    ? "Go ahead, speak naturally. I'll respond instantly." 
                    : "Press the button below to start your conversation."}
                </p>
              </>
            )}
          </div>
          <TranscriptionList transcriptions={transcriptions} />
        </div>
      </main>

      <ChatControls 
        status={status} 
        onStart={startSession} 
        onStop={stopSession} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
};

export default App;
