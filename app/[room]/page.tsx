"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { use, useEffect, useState } from "react";

type RoomPageProps = {
  params: Promise<{ room: string }>;
};

export default function RoomPage(props: RoomPageProps) {
  const { room } = use(props.params);
  const roomName = room;

  const [token, setToken] = useState("");

  useEffect(() => {
    async function join() {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userName: "Guest_" + Math.floor(Math.random() * 1000),
        }),
      });

      const data = await res.json();
      setToken(data.token);
    }
    join();
  }, [roomName]);

  if (!token) return <p style={{ color: "white" }}>Loading…</p>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
      connect
      video
      audio
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

