
import React, { useState, useEffect } from 'react';
import { VideoToText } from './components/VideoToText';
import { VideoGenerator } from './components/VideoGenerator';
import { GeneratedVideo } from './types';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'generation'>('analysis');
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      setLastError(null);
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleError = async (err: any) => {
    const errMsg = err?.message || String(err);
    console.error("API Error Captured:", errMsg);

    if (
      errMsg.toLowerCase().includes("permission denied") || 
      errMsg.toLowerCase().includes("requested entity was not found") || 
      errMsg.toLowerCase().includes("quota") ||
      errMsg.toLowerCase().includes("403") ||
      errMsg.toLowerCase().includes("api key not valid")
    ) {
      setLastError("Permission or Quota issue detected. Please select a different project/key.");
      setHasApiKey(false);
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        setLastError(null);
      }
    } else {
      setLastError(errMsg);
    }
  };

  const handleVideoCreated = (video: GeneratedVideo) => {
    setGeneratedVideos(prev => [video, ...prev]);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4 text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Vinci Analyst</h1>
            <p className="text-gray-400 text-lg">
              {lastError ? (
                <span className="text-red-400 font-medium">Error: {lastError}</span>
              ) : (
                "Professional AI-powered vehicle incident and traffic analytics."
              )}
            </p>
          </div>
          <button
            onClick={handleConnectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            {lastError ? "Try Another API Key" : "Connect to AI Studio"}
          </button>
          <p className="text-xs text-gray-500 leading-relaxed px-4">
            If you see 'Permission Denied', ensure your chosen Google Cloud project has the <b>Gemini API</b> enabled.
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 hover:underline">Billing & Quota Details</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h2 className="font-bold text-lg tracking-tight hidden sm:block">Vinci Analyst</h2>
          </div>

          <nav className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'analysis' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              ANALYSIS
            </button>
            <button
              onClick={() => setActiveTab('generation')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'generation' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              VEO STUDIO
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Secure Connection</span>
            </div>
            <p className="text-[9px] text-gray-500 uppercase">Gemini & Veo Active</p>
          </div>
          <button 
            onClick={handleConnectKey}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium"
          >
            KEY
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {lastError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-sm text-red-300 font-medium">{lastError}</p>
            </div>
            <button onClick={() => setLastError(null)} className="text-red-400/50 hover:text-red-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}

        {activeTab === 'analysis' ? (
          <VideoToText onError={handleError} />
        ) : (
          <VideoGenerator 
            onVideoCreated={handleVideoCreated} 
            videos={generatedVideos} 
            onError={handleError} 
          />
        )}
      </main>
    </div>
  );
};

export default App;