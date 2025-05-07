import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const { channelName } = await req.json();

    try {
        const AGORA_APP_ID = process.env.PUBLIC_AGORA_APP_ID!;
        const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;
        const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID!;
        const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET!;

        const authorization = Buffer.from(`${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`).toString('base64');

        // Step 1: Acquire Resource ID
        const acquireResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/acquire`,
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

        const resourceId = acquireResponse.data.resourceId;

        console.log(resourceId);
        console.log(`https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`);

        // Step 2: Start Recording
        const startResponse = await axios.post(
            `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
            {
                cname: channelName,
                uid: "1000",
                clientRequest: {
                    recordingConfig: {
                        maxIdleTime: 30,
                        streamTypes: 2,
                        audioProfile: 1,
                        channelType: 0,
                        videoStreamType: 0,
                    },
                    storageConfig: {
                        vendor: 1, // 1: Amazon S3
                        region: 0, // S3 region
                        bucket: process.env.AWS_S3_BUCKET_NAME!,
                        accessKey: process.env.AWS_S3_ACCESS_KEY!,
                        secretKey: process.env.AWS_S3_SECRET_KEY!,
                        fileNamePrefix: ["recordings"],
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json({ success: true, resourceId, sid: startResponse.data.sid });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}