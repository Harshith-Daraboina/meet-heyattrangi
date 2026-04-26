"use client";

import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  useRoomContext,
  useLocalParticipant,
  LayoutContextProvider,
  GridLayout,
  ParticipantTile,
  useTracks,
  Chat,
  useLayoutContext,
  FocusLayout,
  CarouselLayout,
  usePinnedTracks,
  RoomAudioRenderer,
  useSpeakingParticipants,
  useParticipants,
  useChat,
  TrackToggle,
  ChatToggle,
  DisconnectButton,
  MediaDeviceMenu,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomEvent, Participant, Track } from "livekit-client";

import { useEffect, useState, useRef, Suspense } from "react";
import AskPragya from "../components/AskPragya";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

interface CustomConferenceProps {
  isHost: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

function CustomConference({ isHost, isRecording, onStartRecording, onStopRecording }: CustomConferenceProps) {
  const room = useRoomContext();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);
  const layoutContext = useLayoutContext();
  const { widget } = layoutContext;

  const pinnedTracks = usePinnedTracks(layoutContext);
  const activeSpeakers = useSpeakingParticipants();
  const participants = useParticipants();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPragya, setShowPragya] = useState(false);
  const [lastSpeakerSid, setLastSpeakerSid] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setControlsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeSpeakers.length > 0) {
      setLastSpeakerSid(activeSpeakers[0].sid);
    }
  }, [activeSpeakers]);

  const isScreenSharing = screenTracks.length > 0;

  let focusTrack: any = pinnedTracks[0];
  if (!focusTrack && activeSpeakers.length > 0) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === activeSpeakers[0].sid);
  }
  if (!focusTrack && lastSpeakerSid) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === lastSpeakerSid);
  }
  if (!focusTrack && cameraTracks.length > 0) {
    focusTrack = cameraTracks.find((t) => !t.participant.isLocal) || cameraTracks[0];
  }

  const isFocusing = focusTrack !== undefined && participants.length > 1;

  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-black overflow-hidden relative">
      {isScreenSharing && (
        <div className="flex-1 flex items-center justify-center bg-black">
          {screenTracks.map((track) => (
            <ParticipantTile
              key={track.publication.trackSid}
              trackRef={track}
              className="max-h-full max-w-full aspect-video"
            />
          ))}
        </div>
      )}

      <div className={`${isScreenSharing ? "h-[30%]" : "flex-1"} overflow-y-auto`}>
        {!isScreenSharing && isFocusing && focusTrack ? (
          <div className="h-full w-full flex flex-col md:flex-row">
            <div className="flex-1 h-[70%] md:h-full">
              <FocusLayout trackRef={focusTrack as any} className="h-full w-full" />
            </div>
            <div className="h-[30%] md:h-full md:w-[250px] overflow-y-auto bg-[#111] p-2 border-l border-[#222]">
              <CarouselLayout tracks={cameraTracks}>
                <ParticipantTile />
              </CarouselLayout>
            </div>
          </div>
        ) : (
          <GridLayout tracks={cameraTracks} className="h-full w-full">
            <ParticipantTile />
          </GridLayout>
        )}
      </div>

      <div className={`absolute top-0 left-0 h-full w-full sm:w-[350px] glass-panel-left z-50 overflow-hidden transition-all duration-300 ease-in-out transform ${showChat ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
        <Chat />
      </div>

      <div className={`absolute top-0 right-0 h-full w-full sm:w-[320px] glass-panel z-[45] flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform ${showParticipants ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-white tracking-tight">Participants ({participants.length})</h3>
          <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-[rgba(255,255,255,0.1)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {participants.map((p) => (
            <div key={p.sid} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                {p.identity.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap opacity-90">
                <span className="text-white text-sm font-medium">{p.identity} {p.isLocal ? "(You)" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AskPragya open={showPragya} onClose={() => setShowPragya(false)} />

      <div className={`floating-control-bar ${controlsVisible ? '' : 'hidden'}`}>
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${isRecording ? "bg-red-600 animate-pulse" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-white" : "bg-red-500"}`} />
        </button>

        <div className="flex items-center">
          <TrackToggle source={Track.Source.Microphone} showIcon={true} />
          <MediaDeviceMenu kind="audioinput" />
        </div>
        <div className="flex items-center">
          <TrackToggle source={Track.Source.Camera} showIcon={true} />
          <MediaDeviceMenu kind="videoinput" />
        </div>
        <TrackToggle source={Track.Source.ScreenShare} showIcon={true} />
        <button 
          onClick={() => setShowChat(!showChat)} 
          className={`w-11 h-11 rounded-xl transition-all duration-200 flex items-center justify-center border ${showChat ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          title="Toggle Chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
        </button>
        
        <button onClick={() => setShowParticipants(!showParticipants)} className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all duration-200 relative">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
           <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10 badge">{participants.length}</div>
        </button>

        <button onClick={() => setShowPragya(!showPragya)} title="Ask Pragya" className={`w-11 h-11 rounded-xl transition-all duration-300 border ${showPragya ? "bg-[#FF6A2D]/20 border-[#FF6A2D]/60 text-[#FF6A2D]" : "bg-white/5 hover:bg-white/10 border-white/10 text-[#FF6A2D]"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor"/>
            <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor"/>
            <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor"/>
            <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor"/>
          </svg>
        </button>

        <button onClick={() => room.disconnect()} className="w-11 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 active:scale-95">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <div className={`absolute bottom-6 right-8 hidden md:flex flex-col items-end pointer-events-none transition-opacity duration-500 ${controlsVisible ? 'opacity-60' : 'opacity-10'}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <img src="/images/logo.png" alt="Logo" className="h-5 w-auto" />
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#FF6A2D] to-[#FF2D55] bg-clip-text text-transparent">
            hey attrangi
          </h2>
        </div>
        <span className="text-gray-400 text-[9px] tracking-[0.2em] uppercase font-bold">track. understand. feel better.</span>
      </div>
    </div>
  );
}

// 🎙 Inner Component to handle Recording and Transcription logic (inside LiveKitRoom)
function RecordingManager({ roomName, isInitialHost, router }: { roomName: string, isInitialHost: boolean, router: any }) {
  const { send } = useChat();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(audioBlob);
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Failed to access microphone for recording.");
    }
  }

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
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Recording saved successfully!");
        if (data.transcript && send) {
          send(`[AUDIO TRANSCRIPT]: ${data.transcript}`);
        }
      } else {
        toast.error("Failed to save recording.");
      }
    } catch (err) {
      toast.error("Error uploading recording.");
    }
  }

  return (
    <CustomConference
      isHost={isInitialHost}
      isRecording={recording}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
    />
  );
}

function RoomPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params.room as string;
  const username = searchParams.get("user") || "Guest";
  const isInitialHost = searchParams.get("host") === "true";

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userName: username, isHost: isInitialHost }),
      });
      const data = await res.json();
      setToken(data.token);
    }
    getToken();
  }, [roomName, username, isInitialHost]);

  if (!token) return <div className="h-screen flex items-center justify-center bg-black text-white">Joining meeting…</div>;

  return (
    <div className="h-screen w-screen bg-black">
      <Toaster position="top-center" richColors />
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL!}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={() => router.push(`/${roomName}/left`)}
        className="h-screen w-screen overflow-hidden"
      >
        <LayoutContextProvider>
          <RecordingManager roomName={roomName} isInitialHost={isInitialHost} router={router} />
          <RoomEvents router={router} />
          <RoomAudioRenderer />
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomPageContent />
    </Suspense>
  );
}

function RoomEvents({ router }: { router: any }) {
  const room = useRoomContext();
  useEffect(() => {
    if (!room) return;
    const handleParticipantConnected = (participant: Participant) => toast.success(`${participant.identity} joined the room`);
    const handleParticipantDisconnected = (participant: Participant) => {
      toast.info(`${participant.identity} left the room`);
      if (participant.metadata) {
        try {
          const metadata = JSON.parse(participant.metadata);
          if (metadata.isHost) {
            toast.error("Host ended the meeting.");
            setTimeout(() => {
              room.disconnect();
              router.push("/left");
            }, 2000);
          }
        } catch (e) { console.error(e); }
      }
    };
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, router]);
  return null;
}
