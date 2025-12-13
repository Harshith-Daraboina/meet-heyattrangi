"use client";
import { useRouter } from "next/navigation";

export default function LeftPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-[#111] p-8 rounded-xl text-center">
        <h1 className="text-white text-2xl mb-4">You left the meeting</h1>

        <button
          onClick={() => router.push("/")}
          className="bg-[#FF6A2D] text-black px-6 py-3 rounded font-semibold"
        >
          Go Home
        </button>
      </div>
    </main>
  );
}
