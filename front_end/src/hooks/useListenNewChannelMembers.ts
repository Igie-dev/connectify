import { useEffect, useState } from 'react'
import { socket } from "@/socket";
import { useAppSelector } from '@/service/store';
import { getCurrentChannelId } from '@/service/slices/channel/channelSlice';
export default function useListenNewChannelMembers() {
    const currentChannelId = useAppSelector(getCurrentChannelId)
    const [channelId, setChannelId] = useState("");
    const [member, setMember] = useState<TChannelMemberData | null>(null);
    useEffect(() => {
        socket.on("new_channel_member", (res: { data: { channelId: string, member: TChannelMemberData } }) => {
            if (currentChannelId === res.data.channelId) {
                setChannelId(res?.data?.channelId);
                setMember(res?.data?.member)
            } else {
                setChannelId("");
                setMember(null)
            }

        })

    }, [currentChannelId])

    return { channelId, member }
}
