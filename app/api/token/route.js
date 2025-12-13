import { AccessToken } from "livekit-server-sdk";

export async function POST(req) {
  const { roomName, userName } = await req.json();

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: userName,
    }
  );

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return Response.json({ token: await at.toJwt() });
}
