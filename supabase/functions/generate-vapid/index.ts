import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const pub = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey)
  );
  
  const privJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const b64url = (arr: Uint8Array) =>
    btoa(String.fromCharCode(...arr))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return new Response(
    JSON.stringify({
      publicKey: b64url(pub),
      privateKey: privJwk.d,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});