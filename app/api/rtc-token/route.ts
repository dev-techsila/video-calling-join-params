import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { uid, channelName } = body;

    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
    const AGORA_APP_CERTIFICATE = process.env.NEXT_AGORA_APP_CERTIFICATE!;

    if (!uid) {
        return NextResponse.json({ success: false, error: 'UID is required' }, { status: 400 });
    }

    try {
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600 * 24;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs);

        console.log(`Generated RTC token for UID: ${uid}, Channel: ${channelName}, Token: ${token}`);

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error('RTC Token generation error:', error);
        return NextResponse.json({ success: false, error: 'Token generation failed' }, { status: 500 });
    }
}