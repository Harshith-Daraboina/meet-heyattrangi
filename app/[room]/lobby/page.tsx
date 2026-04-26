"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "@livekit/components-styles";

export default function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const roomParam = params.room;
  const roomName = typeof roomParam === "string" ? roomParam : roomParam?.[0];
  const initialUsername = searchParams.get("user") || "";

  const [username, setUsername] = useState(initialUsername);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupPreview() {
      if (isCamOn) {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: isMicOn 
          });
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
        }
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
    setupPreview();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamOn]);

  const handleJoin = () => {
    if (!username.trim()) return;
    router.push(`/${roomName}?user=${encodeURIComponent(username)}&audio=${isMicOn}&video=${isCamOn}`);
  };

  if (!roomName) {
    return <div className="h-screen bg-black flex items-center justify-center text-white">Invalid room</div>;
  }

  return (
    <main className="h-screen w-screen bg-[#0A0A0A] flex overflow-hidden font-sans">
      {/* ⬅️ Left Sidebar */}
      <div className="w-full md:w-[400px] h-full bg-[#111111] border-r border-white/5 flex flex-col p-8 z-10">
        <div className="flex items-center gap-4 mb-12">
          <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-[#FF6A2D] to-[#FF2D55] bg-clip-text text-transparent">
            hey attrangi
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-white text-3xl font-bold mb-2">Join meeting</h1>
          <p className="text-gray-400 mb-8">Ready to join <span className="text-[#FF6A2D]">{roomName}</span>?</p>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A2D]/50 transition-all"
            />
            
            <button 
              onClick={handleJoin}
              disabled={!username.trim()}
              className="w-full bg-[#FF6A2D] hover:bg-[#e55a1f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#FF6A2D]/20 flex items-center justify-center gap-2"
            >
              Join meeting
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${isMicOn ? 'bg-white/5 border-white/10 text-white' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}
            >
              {isMicOn ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              )}
            </button>
            <button 
              onClick={() => setIsCamOn(!isCamOn)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${isCamOn ? 'bg-white/5 border-white/10 text-white' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}
            >
              {isCamOn ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M23 7l-7 5 7 5V7z"/></svg>
              )}
            </button>
            <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5 flex flex-col items-center">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
            <p className="text-orange-500 text-sm font-medium">Please ensure your camera and microphone are allowed in your browser settings.</p>
          </div>
          <div className="flex flex-col items-center opacity-80 scale-110">
            <div className="flex items-center gap-2 mb-1">
              <img src="/images/logo-bg-2.png" alt="Logo" className="h-7 w-auto" />
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#FF6A2D] to-[#FF2D55] bg-clip-text text-transparent">
                hey attrangi
              </h2>
            </div>
            <span className="text-gray-400 text-[11px] tracking-[0.3em] uppercase font-bold">track. understand. feel better.</span>
          </div>
        </div>
      </div>

      {/* 🎥 Right Preview Area */}
      <div className="flex-1 h-full bg-[#050505] relative flex items-center justify-center p-8">
        <div className="w-full h-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-[#111] shadow-2xl relative border border-white/5">
          {isCamOn ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M23 7l-7 5 7 5V7z"/></svg>
              </div>
              <p className="text-lg">Camera is turned off</p>
            </div>
          )}
          
          <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-white text-xs font-medium uppercase tracking-wider">{isMicOn ? 'Mic Active' : 'Mic Muted'}</span>
          </div>
        </div>

      </div>
    </main>
  );
}
