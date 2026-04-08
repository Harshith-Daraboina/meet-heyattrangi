"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LeftPage() {
  const router = useRouter();
  const params = useParams();
  const roomName = params.room as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF6A2D] opacity-20 blur-[120px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600 opacity-20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div 
        className={`relative z-10 glass-panel p-10 md:p-14 rounded-3xl text-center max-w-lg w-full mx-4 shadow-2xl border border-[rgba(255,255,255,0.08)] transform transition-all duration-700 ease-out ${
          mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        <div className="w-20 h-20 bg-[rgba(255,106,45,0.1)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-[rgba(255,106,45,0.2)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#FF6A2D]">
            <path d="M15 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H15C16.1046 21 17 20.1046 17 19V14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 9L22 12M22 12L19 15M22 12H9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="text-white text-3xl font-bold mb-3 tracking-tight">You've left the meeting</h1>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed max-w-xs mx-auto">
          Thank you for using <span className="text-[#FF6A2D] font-semibold">Hey Attrangi</span>. We hope you had a productive therapy session.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push(`/${roomName}/lobby`)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Rejoin
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#FF6A2D] to-[#ff8c5a] hover:shadow-[0_0_20px_rgba(255,106,45,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 border-none focus:outline-none focus:ring-2 focus:ring-[#FF6A2D]/50"
          >
            Return Home
          </button>
        </div>
      </div>
    </main>
  );
}
