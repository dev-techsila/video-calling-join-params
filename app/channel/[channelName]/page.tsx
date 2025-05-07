'use client';
import { useParams, useSearchParams } from 'next/navigation';
import Call from '../../../components/Call';


export default function Page() {
    const params = useParams();
    const searchParams = useSearchParams();
    const r_token = searchParams.get('r_token');
    const m_token = searchParams.get('m_token');
    const uid = searchParams.get('uid');

    const channelName = params.channelName;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    if (!appId) {
        console.error("Missing NEXT_PUBLIC_AGORA_APP_ID in .env file");
        return <div>Error: Missing app ID</div>;
    }
    return (
        <main className="flex w-full flex-col">
            <Call
                appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!}
                channelName={channelName}
                rtctoken={r_token}
                rtmtoken={m_token}
                uid={uid}
            />
        </main>
    );
}