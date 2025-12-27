import { getSupabaseAdmin } from "@/lib/supabase";
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

        const timestamp = Date.now();
        const path = `recordings/${roomName}-${timestamp}.webm`;

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.storage
            .from("meeting-recordings")
            .upload(path, file, {
                contentType: "audio/webm",
                upsert: false,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                { error: "Failed to upload to storage", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, path: data.path });
    } catch (err: any) {
        console.error("Upload handler error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
