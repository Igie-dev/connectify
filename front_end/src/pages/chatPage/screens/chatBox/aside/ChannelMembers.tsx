import { useEffect, useState } from "react";
import MemberCard from "./MemberCard";
import useListenNewChannelMember from "@/hooks/useListenNewChannelMembers";
import { useAppSelector } from "@/service/store";
import {
  getCurrentChannelId,
  getCurrentChanneMembers,
} from "@/service/slices/channel/channelSlice";
import useListedRemoveChannelMember from "@/hooks/useListenDeleteChannel";

export default function ChannelMembers() {
  const currentChannelId = useAppSelector(getCurrentChannelId);
  const [members, setMembers] = useState<TChannelMemberData[]>([]);
  const channelMembers = useAppSelector(getCurrentChanneMembers);
  const { channelId: newChannelMembersChannelId, member: newChannelMember } =
    useListenNewChannelMember();
  const { channelId: removeChannelId, userId: removeUserId } =
    useListedRemoveChannelMember();

  useEffect(() => {
    if (channelMembers?.length >= 1) {
      setMembers(channelMembers);
    } else {
      setMembers([]);
    }
  }, [channelMembers]);

  //Add
  useEffect(() => {
    if (currentChannelId === newChannelMembersChannelId && newChannelMember) {
      const existMember = members?.filter(
        (member) => member.userId === newChannelMember?.userId
      );
      if (existMember.length >= 1) return;

      setMembers((prev) => [...prev, { ...newChannelMember }]);
    }
  }, [newChannelMember, currentChannelId, members, newChannelMembersChannelId]);

  //Remove
  useEffect(() => {
    if (
      members?.length >= 1 &&
      removeUserId &&
      currentChannelId === removeChannelId
    ) {
      const existeRemovedMember = members.filter(
        (member) => member.userId === removeUserId
      );

      if (existeRemovedMember.length <= 0) return;

      setMembers((prev) =>
        prev.filter((member) => member.userId !== removeUserId)
      );
    }
  }, [members, currentChannelId, removeChannelId, removeUserId]);

  return (
    <div className="absolute top-0 left-0 flex flex-col w-full h-full gap-2 p-2 pt-5">
      <div className="w-full h-[95%] overflow-y-auto ">
        <ul className="relative flex flex-col items-center w-full gap-1 pb-5 min-h-20 h-fit">
          {members && members?.length >= 1 ? (
            members.map((member) => {
              return (
                <MemberCard key={member.id} user={member?.user as TUserData} />
              );
            })
          ) : members && members?.length <= 0 ? (
            <p className="text-sm">Empty</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
