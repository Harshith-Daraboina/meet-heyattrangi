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
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#111] p-8">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-main.png" alt="Hey Attrangi" width={100} height={100} />
        </div>

        <h1 className="text-center text-3xl font-bold text-white mb-6">
          Hey <span className="text-[#FF6A2D]">Attrangi</span> Meet
        </h1>

        <form onSubmit={goToLobby} className="space-y-4">
          <input
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black border border-[#333] text-white"
          />

          <input
            placeholder="Meeting name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black border border-[#333] text-white"
          />

          <button className="w-full bg-[#FF6A2D] text-black py-3 rounded font-semibold">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
