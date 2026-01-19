
import React, { useState } from 'react';
import { generateVideoWithVeo } from '../services/geminiService';
import { GeneratedVideo } from '../types';

interface VideoGeneratorProps {
  onVideoCreated: (video: GeneratedVideo) => void;
  videos: GeneratedVideo[];
  onError?: (error: any) => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onVideoCreated, videos, onError }) => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setStatusMessage('Connecting to Veo...');
    
    try {
      const videoUrl = await generateVideoWithVeo({
        prompt,
        resolution,
        aspectRatio,
        onProgress: setStatusMessage
      });

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substring(7),
        url: videoUrl,
        prompt,
        timestamp: Date.now(),
        status: 'completed',
        config: { resolution, aspectRatio }
      };

      onVideoCreated(newVideo);
      setPrompt('');
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
        alert('Generation failed. Please ensure your API key is linked to a paid project with Veo access.');
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold">Veo Generation Studio</h1>
        <p className="text-gray-400 mt-2 text-lg">Bring your imagination to life with state-of-the-art cinematic video generation.</p>
      </header>

      <section className="glass rounded-3xl p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A neon hologram of a cybernetic tiger walking through a rainy Tokyo street at night, cinematic lighting, 8k..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-gray-600 resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Resolution</label>
              <div className="flex gap-2">
                {(['720p', '1080p'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all ${resolution === res ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                  >
                    {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-indigo-600/20"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <span>Create Video</span>
              </>
            )}
          </button>

          {isGenerating && (
            <div className="text-center animate-pulse">
              <p className="text-indigo-400 font-medium">{statusMessage}</p>
              <p className="text-xs text-gray-500 mt-1">This typically takes 2-4 minutes depending on model load.</p>
            </div>
          )}
        </form>
      </section>

      {videos.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Recent Creations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="glass rounded-3xl overflow-hidden group">
                <div className={`aspect-[${v.config.aspectRatio === '16:9' ? '16/9' : '9/16'}] bg-black relative`}>
                  <video
                    src={v.url}
                    className="w-full h-full object-cover"
                    controls
                    loop
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-semibold text-white border border-white/10 uppercase">
                      {v.config.resolution}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-sm text-gray-300 line-clamp-2 italic">"{v.prompt}"</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-white/5">
                    <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                    <a
                      href={v.url}
                      download={`veo-video-${v.id}.mp4`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
