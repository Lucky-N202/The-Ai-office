export const dynamic = "force-static";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    return new Response("", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // ads.txt wants the bare "pub-XXXXXXXXXXXXXXXX" form; the ad script tag
  // uses "ca-pub-XXXXXXXXXXXXXXXX" — same ID, different prefix convention.
  // Stripping here means you only ever set the one env var, in whichever
  // form AdSense's dashboard gave it to you, and this stays correct either way.
  const publisherId = clientId.replace(/^ca-/, "");

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
