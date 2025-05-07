"use client";

import AgoraRTC, {
    AgoraRTCProvider,
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRTCClient,
    useRemoteAudioTracks,
    useRemoteUsers,
} from "agora-rtc-react";

import AgoraRTM from "agora-rtm-sdk";

import {
    PhoneXMarkIcon,
    MapIcon,
    MapPinIcon,
    MicrophoneIcon,
    SignalSlashIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
} from "@heroicons/react/24/solid";

import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";

import {
    GoogleMap,
    LoadScript,
    Marker,
    DirectionsRenderer
} from "@react-google-maps/api";

function Call(props: { appId: string; channelName: any, rtctoken: any, rtmtoken: any, uid: any }) {
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [directions, setDirections] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [chatClient, setChatClient] = useState<any>(null);
    const [messages, setMessages] = useState<{ uid: string; text: string }[]>([]);
    const [messageText, setMessageText] = useState("");
    const [rtcToken, setRtcToken] = useState(null);

    // New state for locations. We'll store the device’s latitude and longitude per user.
    const [locations, setLocations] = useState<{ [uid: string]: { lat: number; lng: number } }>({});

    const client = useRTCClient(
        AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
    );



    const handleMapButtonClick = async () => {
        setIsMapVisible((prev) => !prev);
        // This example still demonstrates directions between two hard-coded points.
        // You might consider removing directions if you only want to display live markers.
        const start = { lat: 37.7749, lng: -122.4194 };
        const end = { lat: 34.0522, lng: -118.2437 };
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setDirections(result);
    };

    const handleRecording = async () => {
        if (!isRecording) {
            const response = await axios.post("/api/start-recording", {
                channelName: props.channelName,
            });
            const { resourceId, sid } = response.data;
            setResourceId(resourceId);
            setSid(sid);
            setIsRecording(true);
        } else {
            await axios.post("/api/stop-recording", {
                channelName: props.channelName,
                resourceId,
                sid,
            });
            setIsRecording(false);
            setResourceId(null);
            setSid(null);
        }
    };

    const rtcUid = props.uid
    const rtmUid = props.uid

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const init = async () => {
            try {
                // const [rtcToken, rtmToken] = await Promise.all([
                //     getRTCToken(rtcUid),
                //     getRTMToken(String(rtmUid))
                // ]);
                setRtcToken(props.rtctoken);

                // const rtmClient = AgoraRTM.createInstance(props.appId);

                // await rtmClient.login({ uid: String(rtmUid), token: rtmToken });

                // const channel = await rtmClient.createChannel(props.channelName);
                // // console.log("channe:", channel)
                // await channel.join();

                // channel.on("ChannelMessage", ({ text }, senderId) => {

                //     try {
                //         if (text) {
                //             const message = JSON.parse(text);
                //             if (message.type === "location" && message.data) {
                //                 setLocations((prev) => ({
                //                     ...prev,
                //                     [senderId]: message.data,
                //                 }));
                //             } else {
                //                 setMessages((prev) => [...prev, { uid: senderId, text }]);
                //             }
                //         }
                //     } catch {
                //         if (text) {
                //             setMessages((prev) => [...prev, { uid: senderId, text }]);
                //         }
                //     }
                // });

                // setChatClient(channel);
            } catch (err) {
                console.error("Initialization failed", err);
            }
        };

        init();

        // return () => {
        //     (async () => {

        //         if (chatClient) {
        //             await chatClient.leave();
        //             await chatClient.client.logout();
        //         }
        //     })();
        // };
    }, []);



    // Watch own location and send location updates over the RTM channel.
    // useEffect(() => {
    //     if (!navigator.geolocation) {
    //         console.error("Geolocation is not supported by your browser.");
    //         return;
    //     }
    //     const watchId = navigator.geolocation.watchPosition(
    //         (position) => {
    //             const { latitude, longitude } = position.coords;
    //             const locationData = { lat: latitude, lng: longitude };

    //             // Update our own location in state (use key "Me")
    //             setLocations((prev) => ({
    //                 ...prev,
    //                 Me: locationData,
    //             }));

    //             // If chatClient is ready, send a JSON message with our location
    //             if (chatClient) {
    //                 chatClient.sendMessage({
    //                     text: JSON.stringify({ type: "location", data: locationData }),
    //                 });
    //             }
    //         },
    //         (error) => {
    //             console.log("Error obtaining location", error);

    //             if (error.code === error.PERMISSION_DENIED) {
    //                 console.log("User denied the request for Geolocation.");
    //             } else if (error.code === error.POSITION_UNAVAILABLE) {
    //                 console.log("Location information is unavailable.");
    //             } else if (error.code === error.TIMEOUT) {
    //                 console.log("The request to get user location timed out.");
    //             } else {
    //                 console.log("An unknown error occurred while retrieving location.");
    //             }
    //         },
    //         { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    //     );


    //     return () => {
    //         navigator.geolocation.clearWatch(watchId);
    //     };
    // }, [chatClient]);


    const handleSendMessage = async () => {
        console.log(messageText)
        if (chatClient && messageText.trim()) {
            await chatClient.sendMessage({ text: messageText });
            setMessages((prev) => [...prev, { uid: "Me", text: messageText }]);
            setMessageText("");
        }
    };

    async function getRTCToken(uid: any) {
        const res = await fetch('/api/rtc-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, channelName: props.channelName }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to get RTM token');

        return data.token;
    }

    async function getRTMToken(uid: string) {
        try {
            const res = await fetch('/api/rtm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid }),
            });
            if (!res.ok) throw new Error('HTTP error');
            const data = await res.json();
            return data.token;
        } catch (err) {
            console.error("RTM Token Error:", err);
            throw err;
        }
    }

    return (
        <AgoraRTCProvider client={client}>
            <div className="flex flex-col h-screen bg-gray-800 relative">
                <div className="flex flex-1 overflow-hidden">

                    <div className={`flex-1 ${isMapVisible ? "hidden" : ""} p-4`}>
                        {
                            props.rtctoken &&
                            <Videos
                                channelName={props.channelName}
                                AppID={props.appId}
                                isMicMuted={isMicMuted}
                                isCameraOff={isCameraOff}
                                token={props.rtctoken}
                                uid={rtcUid}
                            />
                        }
                    </div>
                    <div className={`flex-1 ${isMapVisible ? "" : "hidden"} p-4`}>
                        <LoadScript googleMapsApiKey="AIzaSyCApGJh_JprBG8eDd_3_Gd3yKWI1y1iRgY">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={{ lat: 37.7749, lng: -122.4194 }}
                                zoom={10}
                            >
                                {/* Optionally render directions if available */}
                                {directions && <DirectionsRenderer directions={directions} />}
                                {/* Render markers for all live locations */}
                                {Object.keys(locations).map((uid) => (
                                    <Marker
                                        key={uid}
                                        position={locations[uid]}
                                        label={uid === "Me" ? "You" : uid}
                                    />
                                ))}
                            </GoogleMap>
                        </LoadScript>

                    </div>
                    <div className="w-80 h-full bg-gray-900 bg-opacity-70 p-4 overflow-y-auto">
                        <div className="text-white text-lg font-semibold mb-2">Chat</div>
                        <div className="flex flex-col space-y-2 h-[80%] overflow-y-auto">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="text-sm text-white">
                                    <strong>{msg.uid}:</strong> {msg.text}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-gray-700 text-white"
                                placeholder="Type a message"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="ml-2 px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center items-center gap-6 pb-4 bg-gray-900 bg-opacity-80">
                    <button
                        onClick={() => setIsMicMuted((prev) => !prev)}
                        className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                    >
                        {isMicMuted ? (
                            <SignalSlashIcon className="h-6 w-6 text-white" />
                        ) : (
                            <MicrophoneIcon className="h-6 w-6 text-white" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsCameraOff((prev) => !prev)}
                        className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                    >
                        {isCameraOff ? (
                            <VideoCameraSlashIcon className="h-6 w-6 text-white" />
                        ) : (
                            <VideoCameraIcon className="h-6 w-6 text-white" />
                        )}
                    </button>
                    <button
                        onClick={handleRecording}
                        className="p-3 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                    >
                        <span
                            className={`h-4 w-4 rounded-full ${isRecording ? "bg-red-600" : "bg-gray-400"
                                }`}
                        ></span>
                    </button>
                    <a
                        className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition"
                        href="/"
                    >
                        <PhoneXMarkIcon className="h-6 w-6 text-white" />
                    </a>
                    <button
                        onClick={handleMapButtonClick}
                        className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition"
                    >
                        {isMapVisible ? (
                            <MapPinIcon className="h-6 w-6 text-white" />
                        ) : (
                            <MapIcon className="h-6 w-6 text-white" />
                        )}
                    </button>
                </div>

            </div >
        </AgoraRTCProvider >
    );
}


function Videos({ channelName, AppID, isMicMuted, isCameraOff, token, uid }: any) {
    const { isLoading: isLoadingMic, localMicrophoneTrack } =
        useLocalMicrophoneTrack();
    const { isLoading: isLoadingCam, localCameraTrack } =
        useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();
    console.log("Remote users:", remoteUsers);

    const { audioTracks } = useRemoteAudioTracks(remoteUsers);

    usePublish([localMicrophoneTrack, localCameraTrack]);

    useJoin({ appid: AppID, channel: channelName, token, uid });


    useEffect(() => {
        audioTracks.forEach((track) => track.play());
        return () => {
            audioTracks.forEach((track) => track.stop());
        };
    }, [audioTracks]);

    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(!isMicMuted);
        }
    }, [isMicMuted, localMicrophoneTrack]);

    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(!isCameraOff);
        }
    }, [isCameraOff, localCameraTrack]);

    const unit = "minmax(0, 1fr) ";

    return (
        <div className="flex flex-col justify-between w-full h-screen p-1">
            <div
                className={`grid  gap-1 flex-1`}
                style={{
                    gridTemplateColumns:
                        remoteUsers.length > 9
                            ? unit.repeat(4)
                            : remoteUsers.length > 4
                                ? unit.repeat(3)
                                : remoteUsers.length > 1
                                    ? unit.repeat(2)
                                    : unit,
                }}
            >
                {<LocalVideoTrack
                    track={localCameraTrack}
                    play={true}
                    className="w-full h-full"
                />}

                {remoteUsers?.map((user) => (
                    <RemoteUser key={user.uid} user={user} />
                ))}
            </div>
        </div>
    );
}

export default Call;