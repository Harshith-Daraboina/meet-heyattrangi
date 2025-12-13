"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  function createMeeting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roomName.trim()) return;
    router.push(`/${roomName}`);
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Hey Attrangi Meet</h1>

      <form onSubmit={createMeeting} className="flex gap-3">
        <input
          type="text"
          placeholder="Enter a meeting name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Create / Join
        </button>
      </form>
    </main>
  );
}
