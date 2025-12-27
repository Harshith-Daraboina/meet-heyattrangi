
import {
    EgressClient,
    EncodedFileOutput,
    S3Upload,
    EncodedFileType,
} from "livekit-server-sdk";
import { getSupabaseAdmin } from "@/lib/supabase";


console.log("LIVEKIT_URL:", process.env.LIVEKIT_URL);
console.log("LIVEKIT_API_KEY:", process.env.LIVEKIT_API_KEY);
console.log("LIVEKIT_API_SECRET:", process.env.LIVEKIT_API_SECRET);
console.log("SUPABASE_S3_ENDPOINT:", process.env.SUPABASE_S3_ENDPOINT);
console.log("SUPABASE_S3_REGION:", process.env.SUPABASE_S3_REGION);
console.log("SUPABASE_S3_ACCESS_KEY:", process.env.SUPABASE_S3_ACCESS_KEY);
console.log("SUPABASE_S3_SECRET_KEY:", process.env.SUPABASE_S3_SECRET_KEY);
console.log("SUPABASE_S3_BUCKET:", process.env.SUPABASE_S3_BUCKET);


export async function POST(req: Request) {
    const { roomName } = await req.json();

    if (!roomName) {
        return Response.json({ error: "roomName required" }, { status: 400 });
    }

    if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        return Response.json({ error: "LiveKit credentials not configured" }, { status: 500 });
    }

    const egressClient = new EgressClient(
        process.env.LIVEKIT_URL!,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
    );

    const storagePath = `meetings/${roomName}-${Date.now()}.ogg`;

    const output = new EncodedFileOutput({
        fileType: EncodedFileType.OGG,
        filepath: storagePath,
        output: {
            case: "s3",
            value: new S3Upload({
                endpoint: process.env.SUPABASE_S3_ENDPOINT!,
                region: process.env.SUPABASE_S3_REGION!,
                accessKey: process.env.SUPABASE_S3_ACCESS_KEY!,
                secret: process.env.SUPABASE_S3_SECRET_KEY!,
                bucket: process.env.SUPABASE_S3_BUCKET!,
            }),
        },
    });

    const info = await egressClient.startRoomCompositeEgress(
        roomName,
        output,
        { audioOnly: true }
    );

    // ✅ Save metadata in DB
    const supabase = getSupabaseAdmin();
    await supabase.from("meetings").insert({
        room_name: roomName,
        audio_path: storagePath,
    });

    return Response.json({
        success: true,
        egressId: info.egressId,
        audioPath: storagePath,
    });
}
