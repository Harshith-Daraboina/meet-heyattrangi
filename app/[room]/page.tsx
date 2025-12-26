"use client";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params.room as string;
  const username = searchParams.get("user") || "Guest";

  const [token, setToken] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isHost = true; // 🔑 for now

  // 🔹 Get token
  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userName: username,
        }),
      });

      const data = await res.json();
      setToken(data.token);
    }

    getToken();
  }, [roomName, username]);

  // 🔴 START RECORDING
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to access microphone for recording.");
    }
  }

  // ⏹ STOP RECORDING
  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function uploadRecording(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("roomName", roomName);

    try {
      const res = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        console.log("Upload success:", data.path);
        alert("Recording saved successfully!");
      } else {
        console.error("Upload failed:", data.error);
        alert("Failed to save recording.");
      }
    } catch (err) {
      console.error("Error uploading recording:", err);
      alert("Error uploading recording.");
    }
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Joining meeting…
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL!}
      connect
      video
      audio
      onDisconnected={() => router.push(`/${roomName}/left`)}
      className="h-screen"
    >
      {/* 🔹 Top bar */}
      <div className="absolute top-4 right-4 z-[100] flex gap-3">
        {isHost && !recording && (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            ⏺ Start Recording
          </button>
        )}

        {isHost && recording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            ⏹ Stop Recording
          </button>
        )}
      </div>

      {/* 🔹 LiveKit UI */}
      <VideoConference />

    </LiveKitRoom>
  );
}
