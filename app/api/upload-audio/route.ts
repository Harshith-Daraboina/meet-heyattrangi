import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

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

        // Determine final URL. Ideally 'secure_url' is the mp3 one.
        // Cloudinary returns the url to the resource. We specified format: mp3, so it should be .mp3

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
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
