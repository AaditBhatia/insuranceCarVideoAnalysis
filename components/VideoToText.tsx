
import React, { useState } from 'react';
import { analyzeVideo, getNearbyClaimCenters } from '../services/geminiService';
import { GroundingLink } from '../types';

interface VideoToTextProps {
  onError?: (error: any) => void;
}

export const VideoToText: React.FC<VideoToTextProps> = ({ onError }) => {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [prompt, setPrompt] = useState('Perform a full insurance forensic audit. Assess liability, damage points, and environmental contributors.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [nearbyLinks, setNearbyLinks] = useState<GroundingLink[]>([]);
  const [isFindingCenters, setIsFindingCenters] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBlob(file);
      setSelectedVideoUrl(URL.createObjectURL(file));
      setResult(null);
      setNearbyLinks([]);
    }
  };

  const findClaimCenters = async () => {
    setIsFindingCenters(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const links = await getNearbyClaimCenters(pos.coords.latitude, pos.coords.longitude);
        setNearbyLinks(links);
        setIsFindingCenters(false);
      }, () => {
        setIsFindingCenters(false);
        alert("Location permission required for mapping.");
      });
    } catch (e) {
      setIsFindingCenters(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedBlob) return;
    setIsAnalyzing(true);
    try {
      const text = await analyzeVideo(selectedBlob, prompt);
      setResult(text);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Certified Claims Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Insurance Forensic Hub</h1>
          <p className="text-gray-400 mt-1">Autonomous accident reconstruction and damage auditing.</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={findClaimCenters}
             disabled={isFindingCenters}
             className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-gray-300"
           >
             {isFindingCenters ? "Locating..." : "Find Nearby Claims Centers"}
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/></svg>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Col: Evidence Input */}
        <div className="xl:col-span-5 space-y-6">
          <section className="glass rounded-[2rem] p-6 space-y-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Digital Evidence</h3>
              <label className="group relative cursor-pointer bg-white text-black text-[10px] font-black py-1.5 px-3 rounded-full hover:bg-indigo-400 hover:text-white transition-all">
                UPLOAD FOOTAGE
                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {selectedVideoUrl ? (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                <video src={selectedVideoUrl} controls className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="aspect-video border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 gap-4 bg-black/10">
                <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Drop Dashcam Clip Here</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Adjuster Focus Area</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "LIABILITY", prompt: "Perform a detailed fault analysis based on lane positioning and traffic signals." },
                  { label: "DAMAGE AUDIT", prompt: "Identify all points of impact and estimate damage severity to the bodywork." },
                  { label: "ENVIRONMENT", prompt: "Report on weather, road wetness, and lighting conditions during the incident." }
                ].map(chip => (
                  <button 
                    key={chip.label}
                    onClick={() => setPrompt(chip.prompt)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded-xl p-4 min-h-[100px] text-xs font-mono text-indigo-100 placeholder-gray-700 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedVideoUrl || isAnalyzing}
              className="w-full bg-white text-black hover:bg-indigo-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
            >
              {isAnalyzing ? "Processing Neural Audit..." : "Generate Official Report"}
            </button>
          </section>

          {nearbyLinks.length > 0 && (
            <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl animate-in fade-in slide-in-from-left-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/></svg>
                Grounding: Local Support Centers
              </h4>
              <div className="space-y-3">
                {nearbyLinks.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.uri} 
                    target="_blank" 
                    className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <span className="text-xs font-medium text-gray-300 group-hover:text-indigo-300">{link.title}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-indigo-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Analysis Result */}
        <div className="xl:col-span-7 space-y-6">
          <section className="glass rounded-[2rem] p-8 h-full min-h-[600px] flex flex-col border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs">Statement of Evidence</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Generated via Vinci Analyst Neural Engine</p>
                </div>
              </div>
              {result && (
                <button 
                  onClick={() => window.print()}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Print Report"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                </button>
              )}
            </div>

            {result ? (
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-thin">
                <div className="prose prose-invert prose-indigo prose-sm max-w-none text-indigo-50 font-medium leading-relaxed bg-black/20 p-8 rounded-3xl border border-white/5 shadow-inner whitespace-pre-wrap">
                  {result}
                </div>
                
                <div className="flex gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                  <div className="w-1 bg-indigo-500 rounded-full"></div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase leading-relaxed tracking-wider">
                    Disclaimer: This report is a preliminary AI assessment. It should be used as supporting evidence only and verified by a licensed human adjuster.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-2">Evidence Buffer Empty</h4>
                <p className="text-[10px] max-w-[240px] leading-relaxed uppercase font-bold tracking-wider">Upload and analyze footage to generate an official forensic statement of liability and damages.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
