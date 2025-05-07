import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const { channelName, resourceId, sid } = await req.json();

    try {
        const AGORA_APP_ID = process.env.PUBLIC_AGORA_APP_ID!;
        const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID!;
        const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET!;

        const authorization = Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString('base64');

        console.log(resourceId);
        console.log(`https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`);

        const stopResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
            {
                cname: channelName,
                uid: "1000",
                clientRequest: {},
            },
            {
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}