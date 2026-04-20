import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;
const GROQ_WHISPER_MODEL = "whisper-large-v3-turbo";

async function transcribeAudio(buffer: Buffer, fileName: string): Promise<string> {
    const url = "https://api.groq.com/openai/v1/audio/transcriptions";
    
    // Create a Blob from the buffer for the FormData
    const blob = new Blob([new Uint8Array(buffer)], { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("model", GROQ_WHISPER_MODEL);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq Transcription error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.text || "";
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const roomName = formData.get("roomName") as string;

        if (!file || !roomName) {
            return NextResponse.json(
                { error: "Missing file or roomName" },
                { status: 400 }
            );
        }

        // Convert File → Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: "video", // REQUIRED for audio uploads
                        folder: "meeting-recordings",
                        public_id: `${roomName}-${Date.now()}`,
                        format: "mp3",          // Convert to mp3
                        audio_codec: "mp3",
                        audio_frequency: 22050, // Voice-optimized frequency
                        bit_rate: "64k",        // Voice-optimized bitrate
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        // Transcribe using Groq
        let transcript = "";
        try {
            transcript = await transcribeAudio(buffer, `${roomName}-${Date.now()}.webm`);
        } catch (transcribeErr) {
            console.error("Transcription failed:", transcribeErr);
            // We continue even if transcription fails, as the upload was successful
        }

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            transcript: transcript,
            publicId: uploadResult.public_id,
            duration: uploadResult.duration,
            format: uploadResult.format,
            bytes: uploadResult.bytes
        });
    } catch (err: any) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json(
            { error: "Upload failed", details: err.message },
            { status: 500 }
        );
    }
}
