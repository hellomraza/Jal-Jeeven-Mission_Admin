import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { folder, public_id } = body || {};

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        {
          error:
            "Missing Cloudinary server configuration (CLOUDINARY_API_KEY/SECRET/CLOUDINARY_CLOUD_NAME)",
        },
        { status: 500 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const params: Record<string, string | number> = { timestamp };
    if (folder) params.folder = folder;
    if (public_id) params.public_id = public_id;

    // build string to sign (sorted by key)
    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

    return NextResponse.json({ signature, timestamp, apiKey, cloudName });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create signature" },
      { status: 500 },
    );
  }
}
