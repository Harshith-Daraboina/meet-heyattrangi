"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  function goToLobby(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName || !username) return;

    router.push(`/${roomName}/lobby?user=${encodeURIComponent(username)}`);
  }

  return (
    <main className="relative h-screen w-full overflow-y-auto overflow-x-hidden">
      {/* Background Image - Fixed so it doesn't scroll */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/mental-health-bg2.jpg"
          alt="Peaceful Background"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Gradient Overlay for Content Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Main Layout Container - Min height for vertical alignment */}
      <div className="relative z-10 w-full min-h-full flex flex-col justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Col: Branding & Editorial Content (Spans 7) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-white text-center lg:text-left pt-8 lg:pt-0">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10">
                <Image src="/images/logo-main.png" alt="Hey Attrangi" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                <span className="font-semibold text-xs sm:text-sm tracking-wide uppercase text-[#FFD285]">Mental Health Reimagined</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-xl">
                Hey <span className="text-[#FF6A2D]">Attrangi</span> Meet
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-2xl leading-relaxed drop-shadow-md mx-auto lg:mx-0">
                Your safe space for connection and healing. <br className="hidden md:block" />
                <span className="font-medium text-[#FFD285]">AI-integrated therapy</span> for the modern mind.
              </p>
            </div>

            {/* Hidden on Mobile as requested ("remove extra items") */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 text-left">
              <FeatureCard
                icon={<HeartIcon />}
                title="Neurodivergent Support"
                description="Specialized connection for unique minds."
              />
              <FeatureCard
                icon={<ClockIcon />}
                title="Flexible Pricing"
                description="Transparent hourly cost structure."
              />
              <FeatureCard
                icon={<BrainIcon />}
                title="AI Integrated"
                description="Modern tech & research for better care."
              />
            </div>
          </div>

          {/* Right Col: Login Form (Spans 5) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full pb-8 lg:pb-0">
            <div className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden group mx-auto">

              {/* Decorative Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6A2D]/30 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF6A2D]/40 transition-all duration-700" />

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 relative z-10">Welcome Back</h2>
              <p className="text-white/60 mb-6 sm:mb-8 relative z-10 text-sm sm:text-base">Enter your details to join the session</p>

              <form onSubmit={goToLobby} className="space-y-4 sm:space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Display Name</label>
                  <input
                    placeholder="e.g. Alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6A2D] focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Room Name</label>
                  <input
                    placeholder="e.g. Therapy-Room-1"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6A2D] focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>

                <button className="w-full bg-[#FF6A2D] hover:bg-[#ff5500] text-white text-base sm:text-lg py-3 sm:py-4 rounded-2xl font-bold tracking-wide shadow-lg shadow-[#FF6A2D]/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  Continue <ArrowRightIcon />
                </button>
              </form>

              <div className="mt-6 sm:mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest font-semibold">Secure • Private • Encrypted</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
      <div className="text-[#FF6A2D] mb-1">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <p className="text-white/70 text-sm leading-snug">{description}</p>
      </div>
    </div>
  )
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  )
}

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}
