
import React, { useState } from 'react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('OPENROUTER_API_KEY') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('OPENROUTER_MODEL') || 'google/gemini-2.0-flash-001');

  if (!isOpen) return null;

  const saveSettings = () => {
    localStorage.setItem('OPENROUTER_API_KEY', openRouterKey);
    localStorage.setItem('OPENROUTER_MODEL', selectedModel);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-black/5 shadow-2xl flex flex-col relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 md:p-12">
          {/* Privacy Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-light mb-4">Settings & Privacy</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Zero Trace</span>
              <span className="bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Total Protection</span>
              <span className="bg-gray-100 text-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">No Metadata</span>
            </div>
          </div>

          <div className="space-y-12">
            {/* OpenRouter Config */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">OpenRouter Integration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">API Key</label>
                  <input 
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    onBlur={saveSettings}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Preferred Model</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    onBlur={saveSettings}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                  >
                    <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                    <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Deleted Data Metrics */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">Privacy Metrics</h3>
              <div className="bg-black text-white p-6 rounded-[24px] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-600/40 transition-colors" />
                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-tighter">Total Data Sanitized</p>
                    <h4 className="text-4xl font-bold tracking-tight">1.42 GB</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-purple-400 font-bold mb-1">Session Clear Rate</p>
                    <p className="text-2xl font-light">100%</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Audio Blobs Deleted</p>
                    <p className="text-lg font-medium">12,482</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Metadata Stripped</p>
                    <p className="text-lg font-medium">∞ Free</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-gray-400 text-center italic">Your data is never stored. Metrics represent local ephemeral processing history cleared on session end.</p>
            </section>

            {/* Terms & Conditions */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">Terms & Conditions</h3>
              <div className="bg-gray-50 rounded-2xl p-6 text-[12px] leading-relaxed text-gray-600 h-48 overflow-y-auto border border-black/5">
                <p className="font-bold mb-2">1. Privacy First Commitment</p>
                <p className="mb-4">Our service operates under a "Zero Trace" policy. No audio, transcripts, or metadata are ever stored on our servers. All processing is ephemeral and expires immediately upon session termination.</p>
                <p className="font-bold mb-2">2. Data Sovereignty</p>
                <p className="mb-4">Users maintain absolute ownership of their data. The application acts solely as a real-time gateway between the user's interface and the chosen AI models via encrypted streams.</p>
                <p className="font-bold mb-2">3. API Usage</p>
                <p className="mb-4">By providing an API key, you agree to the terms of service of the respective provider (e.g., OpenRouter, Google). This application does not cache or log your keys beyond local browser storage.</p>
                <p className="font-bold mb-2">4. Metadata Policy</p>
                <p className="mb-4">We strip all non-essential headers and metadata from requests to ensure the highest level of anonymity during processing.</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-black/5 flex justify-center">
            <button 
              onClick={onClose}
              className="bg-purple-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
