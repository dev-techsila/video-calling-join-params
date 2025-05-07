import React, { useEffect } from 'react'
import {
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteAudioTracks,
    useRemoteUsers,
} from "agora-rtc-react";


const Videos = ({ channelName, AppID, isMicMuted, isCameraOff, token, uid }: any) => {
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
                {localCameraTrack && <LocalVideoTrack
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

export default Videos