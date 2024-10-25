import useListenChangeChannelName from "@/hooks/useListenChangeChannelName";
import { useEffect, useState } from "react";
type Props = {
  channelName: string;
  channelId: string;
  className?: string;
};
export default function ChannelName({
  channelName,
  channelId,
  className,
}: Props) {
  const [name, setName] = useState("");
  const { newChannelName, newNameChannelId } =
    useListenChangeChannelName(channelId);

  useEffect(() => {
    setName(channelName);
  }, [channelName]);

  useEffect(() => {
    if (newNameChannelId === channelId) {
      setName(newChannelName);
    }
  }, [newChannelName, newNameChannelId, channelId]);

  return <span className={`${className}`}>{name}</span>;
}
