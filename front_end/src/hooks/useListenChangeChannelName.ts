import { useEffect, useState } from "react";
import { socket } from "@/socket";
export default function useListenChangeChannelName(channelId: string) {
  const [newChannelName, setNewChannelName] = useState("");
  const [newNameChannelId, setNewNameChannelId] = useState("")
  useEffect(() => {
    socket.on(
      "change_channel_name",
      (res: { data: { channelId: string; channelName: string } }) => {
        if (channelId !== res?.data?.channelId) return;
        if (res.data.channelName) {
          setNewChannelName(res?.data?.channelName);
          setNewNameChannelId(res?.data?.channelId)
        } else {
          setNewChannelName("");
          setNewNameChannelId("")
        }

      }
    );

  }, [channelId]);

  return { newChannelName, newNameChannelId };
}
