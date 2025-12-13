"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomName = params.room as string;
  const username = searchParams.get("user") || "Guest";

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userName: username }),
      });

      const data = await res.json();
      setToken(data.token);
    }

    getToken();
  }, [roomName, username]);

  if (!token) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        Joining meeting…
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL!}
        connect
        onDisconnected={() => router.push(`/${roomName}/left`)}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
