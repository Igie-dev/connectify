import { useEffect, useState } from 'react'
import { socket } from "@/socket";
import { useAppSelector } from '@/service/store';
import { getCurrentUser } from '@/service/slices/user/userSlice';

export default function useListedRemoveChannelMember() {
    const [channelId, setChannelId] = useState("");
    const [userId, setUserId] = useState("");
    const { userId: currentUserId } = useAppSelector(getCurrentUser);

    useEffect(() => {
        socket.on("remove_channel_member", (res: { data: { channelId: string, userId: string } }) => {
            if (res?.data?.channelId) {
                setChannelId(res?.data?.channelId);
                setUserId(res?.data?.userId)
            } else {
                setChannelId("");
                setUserId("")
            }

        })

    }, [currentUserId])

    return { channelId, userId }
}
