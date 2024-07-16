import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";

import {
  createChannel,
  userChannels,
  getChannel,
  deleteChannel,
  channelMessages,
  sendMessage,
  seenChannel,
  changeChannelName,
  removeChannelmember,
  requestJoinChannel,
  getChannelMembers,
  getChannelRequestJoin,
  acceptRequestChannelJoin,
} from "../controller/channelsController.js";

const router = express.Router();
router.use(verifyJWT);

router.route("/").post(createChannel).delete(deleteChannel);

router.route("/user/:userId").get(userChannels);

router.route("/:channelId").get(getChannel);

router.route("/:channelId/messages").post(sendMessage).get(channelMessages);

router.route("/messages/seen").post(seenChannel);

router.route("/changename").post(changeChannelName);

router.route("/members/:channelId").get(getChannelMembers);

router.route("/members/remove").delete(removeChannelmember);

router.route("/members/join").post(requestJoinChannel);

router.route("/members/join/:channelId").get(getChannelRequestJoin);

router.route("/members/join/accept").post(acceptRequestChannelJoin);

export default router;
