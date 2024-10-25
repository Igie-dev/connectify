import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetChannelRequestJoinQuery } from "@/service/slices/channel/channelApiSlice";
import LoaderSpinner from "@/components/loader/LoaderSpinner";
import RequestJoinCard from "./RequestJoinCard";
import useListenNewChannelMembers from "@/hooks/useListenNewChannelMembers";
export default function RequestJoinList() {
  const [requestList, setRequestList] = useState<TChannelMemberData[]>([]);
  const { channelId } = useParams();
  const { data, isFetching, refetch } = useGetChannelRequestJoinQuery(
    channelId as string
  );
  const { channelId: newChannelMembersChannelId, member: newMember } =
    useListenNewChannelMembers();

  useEffect(() => {
    if (data?.length >= 1) {
      setRequestList(data);
    } else {
      setRequestList([]);
    }
  }, [data]);

  useEffect(() => {
    if (channelId === newChannelMembersChannelId && newMember) {
      const existMember = requestList?.filter(
        (member) => member.userId === newMember?.userId
      );
      if (existMember.length <= 0) return;
      refetch();
    }
  }, [channelId, refetch, newMember, requestList, newChannelMembersChannelId]);

  return (
    <div className="absolute top-0 left-0 flex flex-col w-full h-full gap-2 p-2 pt-5">
      <div className="w-full h-[95%] overflow-y-auto ">
        <ul className="relative flex flex-col items-center w-full gap-1 pb-5 min-h-20 h-fit">
          {isFetching ? <LoaderSpinner /> : null}
          {!isFetching && requestList && requestList?.length >= 1
            ? requestList.map((member) => {
                return (
                  <RequestJoinCard
                    key={member.id}
                    user={member?.user as TUserData}
                  />
                );
              })
            : null}

          {!isFetching && requestList && requestList?.length <= 0 ? (
            <p className="text-sm">Empty</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
