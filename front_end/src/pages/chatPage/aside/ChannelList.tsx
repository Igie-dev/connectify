import ChannelCard from "./channelCard/ChannelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserChannelsQuery } from "@/service/slices/channel/channelApiSlice";
import { useLayoutEffect, useEffect, useState } from "react";
import { useAppSelector } from "@/service/store";
import { getCurrentUser } from "@/service/slices/user/userSlice";
import { useNavigate, useParams } from "react-router-dom";
import useListenNewMessage from "@/hooks/useListenNewMessage";
import useListedRemoveChannelMember from "@/hooks/useListedRemoveChannelMember";
import useListenDeleteChannel from "@/hooks/useListenDeleteChannel";
type Props = {
  handleAside: () => void;
  searchText: string;
};
export default function ChannelList({ handleAside, searchText }: Props) {
  const { userId: currentUserId } = useAppSelector(getCurrentUser);
  const newMessage = useListenNewMessage();
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { channelId: removeChannelId, userId: removeUserId } =
    useListedRemoveChannelMember();

  const { channelId: deletedChannelId, userId: deleteChannelUserId } =
    useListenDeleteChannel();

  const { data, isFetching, isError } = useGetUserChannelsQuery({
    userId: currentUserId,
    search: searchText,
  });

  const [channels, setChannels] = useState<TChannelData[]>([]);

  //Handle data from api request
  useEffect(() => {
    setChannels(data);
  }, [data]);

  //new Message
  useEffect(() => {
    if (newMessage && channels) {
      const newChannelId = newMessage.channelId;

      const newMessageId = newMessage?.messages[0]?.messageId as string;

      const existUserAsMember = newMessage.members.filter(
        (m) => m.userId === currentUserId && m.joinApproved
      );

      if (existUserAsMember?.length === 0) return;

      //If channels not empty
      //Check if channel is exist on the list
      const existChannel = channels?.filter(
        (c) => c.channelId === newChannelId
      );

      //if message aleady in channel do not modify channel
      const channelLastMessageId = existChannel[0]?.messages[0]?.messageId;
      if (channelLastMessageId === newMessageId) return;

      //if is exist
      //Modified current list to update message
      if (existChannel?.length >= 1) {
        const existMessage =
          existChannel[0]?.messages.filter(
            (msg) => msg.messageId === newMessageId
          ).length > 0;

        if (!existMessage) {
          const updateChannelMessage = channels.map((c: TChannelData) => {
            if (c.channelId === newChannelId) {
              //Update messages data of channel
              const newMessages = newMessage?.messages;
              //Update members data of channel to desplay channel seen
              const newMembers = newMessage?.members;

              const newChannelName = newMessage?.channelName;
              // Update the channel with the new messages array
              return {
                ...c,
                group_name: newChannelName,
                members: newMembers,
                messages: newMessages,
              };
            }
            return c;
          });

          const latestChannel = updateChannelMessage.filter(
            (c) => c.channelId === newChannelId
          );

          setChannels((prev) => [
            { ...latestChannel[0] },
            ...prev.filter((c) => c.channelId !== newChannelId),
          ]);
        }
      } else {
        //Not exist
        //Unshift channel to list
        //Or add the new channel to top
        setChannels((prev) => [{ ...newMessage }, ...prev]);
      }
    }
  }, [newMessage, currentUserId, channels]);

  //user Remove or leave from channel
  useEffect(() => {
    //Leave channel
    if (removeChannelId && removeUserId === currentUserId) {
      setChannels((prev) =>
        prev.filter((c) => c.channelId !== removeChannelId)
      );
    }
  }, [removeChannelId, removeUserId, currentUserId]);

  //Channel deleted
  useEffect(() => {
    if (deletedChannelId && deleteChannelUserId === currentUserId) {
      console.log("Delete channnel: ", deleteChannelUserId);
      setChannels((prev) =>
        prev.filter((c) => c.channelId !== deletedChannelId)
      );
    }
  }, [deletedChannelId, deleteChannelUserId, currentUserId]);

  //Handle auto select channel when first visit
  useLayoutEffect(() => {
    if (channels?.length >= 1) {
      if (!channelId) {
        navigate(`/c/${channels[0]?.channelId}`);
      } else {
        const channelExists = channels.filter((c) => c.channelId === channelId);
        if (channelExists.length === 0) {
          navigate(`/c/${channels[0]?.channelId}`);
        }
      }

      return;
    }
  }, [channelId, channels, navigate, searchText]);

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 gap-2 overflow-y-auto">
      <ul className="flex flex-col w-full h-fit items-center  gap-[2px] pb-5 px-0">
        {isFetching ? (
          <LoaderUi />
        ) : (
          <>
            {isError || channels?.length <= 0 ? (
              <p className="mt-10 text-sm">Empty</p>
            ) : (
              channels?.map((c: TChannelData) => {
                return (
                  <ChannelCard
                    key={c.id}
                    channel={c}
                    handleAside={handleAside}
                  />
                );
              })
            )}
          </>
        )}
      </ul>
    </div>
  );
}

const LoaderUi = () => {
  const loader = [];
  for (let i = 0; i < 5; i++) {
    loader.push(
      <li
        key={i}
        className="flex items-center w-full gap-3 p-2 cursor-pointer h-fit border-border/70"
      >
        <div className="overflow-hidden rounded-full w-11 h-11">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="flex flex-col w-[80%] h-full justify-center gap-2">
          <div className="w-full h-6">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="flex-1 w-full">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </li>
    );
  }
  return loader;
};
