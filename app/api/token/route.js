import { AccessToken } from "livekit-server-sdk";

export async function POST(req) {
  const { roomName, userName, isHost } = await req.json();

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userName,
    metadata: JSON.stringify({ isHost }),
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  // I have added this line to fix the error
  const token = await at.toJwt();

  return Response.json({ token });
}
