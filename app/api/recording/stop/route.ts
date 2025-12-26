
import { EgressClient } from "livekit-server-sdk";

export async function POST(req: Request) {
    const { egressId } = await req.json();

    if (!egressId) {
        return Response.json({ error: "egressId required" }, { status: 400 });
    }

    const egressClient = new EgressClient(
        process.env.LIVEKIT_URL!,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
    );

    try {
        await egressClient.stopEgress(egressId);
        return Response.json({ success: true });
    } catch (error) {
        console.error("Error stopping recording:", error);
        return Response.json({ error: "Failed to stop recording" }, { status: 500 });
    }
}
