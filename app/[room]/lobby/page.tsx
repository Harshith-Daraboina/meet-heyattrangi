"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";

export default function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const roomParam = params.room;
  const roomName =
    typeof roomParam === "string" ? roomParam : roomParam?.[0];

  const username = searchParams.get("user") || "Guest";

  if (!roomName) {
    return <p className="text-white text-center mt-10">Invalid room</p>;
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#111] rounded-xl p-6">
        <h2 className="text-white text-xl mb-4 text-center">
          Ready to join <span className="text-[#FF6A2D]">{roomName}</span>
        </h2>

        <PreJoin
          defaults={{
            username,
            audioEnabled: true,
            videoEnabled: true,
          }}
          onSubmit={(values) => {
            // ✅ THIS is the missing piece
            router.push(
              `/${roomName}?user=${encodeURIComponent(values.username)}&audio=${values.audioEnabled}&video=${values.videoEnabled}`
            );
          }}
        />
      </div>
    </main>
  );
}
