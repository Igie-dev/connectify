import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import http from "http";
import express from "express";
dotenv.config();
const audience = process.env.CLIENT_URL;
const issuer = process.env.SERVER_URL;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: audience,
    method: ["GET", "POST"],
  },
});

const getRecipentSocketId = (recipentId) => {
  return userSocketMap[recipentId];
};

const userSocketMap = {};

// //Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    {
      ignoreExpiration: false,
      audience: `${audience}`,
      issuer: `${issuer}`,
    },
    (err, decoded) => {
      if (err) return;
      if (decoded.User.userId) next();
    }
  );
});

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  const userId = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    {
      ignoreExpiration: false,
      audience: `${audience}`,
      issuer: `${issuer}`,
    },
    (err, decoded) => {
      if (err) return;
      return decoded.User.userId;
    }
  );

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("onlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

//Event broadcast new message
const emitNewMessage = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("new_message", {
      data,
    });
  }
};

//Event broadcast rename channel
const emitChangeChannelName = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("change_channel_name", {
      data,
    });
  }
};

//Event broadcast removechannelMember
const emitingRemoveChannelMember = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("remove_channel_member", {
      data,
    });
  }
};

//Event broadcast removechannelMember
const emitingDeleteChannel = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("delete_channel", {
      data,
    });
  }
};

//Event broadcast removechannelMember
const emitingNewChannelMembers = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("new_channel_member", {
      data,
    });
  }
};

//Event broadcast seen channel
const emitingSeen = (receipent, data) => {
  const receipentSocketId = getRecipentSocketId(receipent);
  if (receipentSocketId) {
    io.to(receipentSocketId).emit("seen", {
      data,
    });
  }
};

export {
  getRecipentSocketId,
  emitNewMessage,
  emitChangeChannelName,
  emitingRemoveChannelMember,
  emitingSeen,
  emitingDeleteChannel,
  emitingNewChannelMembers,
  server,
  io,
  app,
};
