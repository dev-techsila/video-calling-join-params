import { NextRequest, NextResponse } from 'next/server';
import { RtmTokenBuilder, RtmRole } from 'agora-access-token';

export async function POST(req: NextRequest) {
    const { uid } = await req.json();

    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
    const AGORA_APP_CERTIFICATE = process.env.NEXT_AGORA_APP_CERTIFICATE!;

    if (!uid) {
        return NextResponse.json({ success: false, error: 'UID is required' }, { status: 400 });
    }

    try {
        const role = RtmRole.Rtm_User;
        const expirationTimeInSeconds = 3600 * 24;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtmTokenBuilder.buildToken(
            AGORA_APP_ID,
            AGORA_APP_CERTIFICATE,
            uid.toString(),
            role,
            privilegeExpiredTs
        );
        console.log(`Generated RTM token for UID: ${uid} Token: ${token}`);

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error('RTM Token generation error:', error);
        return NextResponse.json({ success: false, error: 'Token generation failed' }, { status: 500 });
    }
}