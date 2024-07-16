import { Button } from "@/components/ui/button";
import { Share, Image, Copy, Trash } from "lucide-react";
import DisplayAvatar from "@/components/shared/DisplayAvatar";
import { useAppSelector } from "@/service/store";
import { getCurrentUser } from "@/service/slices/user/userSlice";
import { Link } from "react-router-dom";
import ChangeChannelName from "./ChangeChannelName";
import DeleteChannel from "./DeleteChannel";
import CustomTooltip from "@/components/shared/CustomTooltip";
import RemoveChannelMember from "./RemoveChannelMember";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getCurrentChannelAdminId,
  getCurrentChannelAvatar,
  getCurrentChannelId,
  getCurrentChannelName,
} from "@/service/slices/channel/channelSlice";

import ChannelName from "@/pages/chatPage/aside/channelCard/ChannelName";

function Header() {
  const { userId: currentUserId } = useAppSelector(getCurrentUser);
  const adminId = useAppSelector(getCurrentChannelAdminId);
  const currentChannelId = useAppSelector(getCurrentChannelId);
  const currentChannelName = useAppSelector(getCurrentChannelName);
  const currentChannelAvatar = useAppSelector(getCurrentChannelAvatar);
  const user = useAppSelector(getCurrentUser);
  const handleCopyId = () => {
    navigator.clipboard.writeText(`${currentChannelId}`);
  };
  return (
    <header className="flex flex-col items-center justify-between w-full gap-5 px-5 py-4 h-fit">
      <div className="flex flex-col items-center justify-center w-full space-y-2">
        <div className="overflow-hidden border rounded-full w-14 h-14">
          <DisplayAvatar id={currentChannelAvatar} />
        </div>

        <ChannelName
          channelId={currentChannelId}
          channelName={currentChannelName}
          className="text-sm font-semibold truncate"
        />
      </div>
      <div className="flex items-center justify-center w-full gap-1 ">
        <ChangeChannelName
          channelId={currentChannelId}
          channelName={currentChannelName}
          avatarId={currentChannelAvatar}
        />

        <Button size="icon" variant="outline">
          <Link
            to={`/avatar/upload/${currentChannelId}`}
            className="flex !justify-center w-full !px-2"
          >
            <CustomTooltip title="Change profile">
              <Image size={20} />
            </CustomTooltip>
          </Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Share size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Copy ID</DialogTitle>
              <DialogDescription>
                Copy your ID and share it with whoever you want to send you a
                message.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="channelId" className="sr-only">
                  ID
                </Label>
                <Input
                  id="channelId"
                  defaultValue={currentChannelId}
                  readOnly
                />
              </div>
              <Button size="sm" onClick={handleCopyId} className="px-3">
                <span className="sr-only">Copy</span>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {adminId !== user?.userId ? (
          <RemoveChannelMember
            cardDescription="Are you sure you want to leave this channel?"
            cardTitle="Leave channel"
            user={user}
            type="leave"
          >
            <Button size="icon" title="Leave" variant="outline">
              <Trash size={20} />
            </Button>
          </RemoveChannelMember>
        ) : (
          <DeleteChannel
            channelId={currentChannelId}
            channelName={currentChannelName}
            channelAvatarId={currentChannelAvatar}
            userId={currentUserId}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
