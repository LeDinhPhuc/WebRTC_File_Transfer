const express = require("express");
const app = express();
const socket = require("socket.io");
const http = require("http");
const server = http.createServer(app);

app.use(express.static("public"));

server.listen(5000, function () {
  console.log("Server is listening at %s port", 5000);
});

const io = socket(server);

let channels = {};
let sockets = {};

io.on("connection", function (socket) {
  let channel;

  socket.channels = {};
  sockets[socket.id] = socket;
  console.log("[" + socket.id + "] connection accepted");

  socket.on("disconnect", function (reason) {
    console.log("reason: ", reason);
    for (const channel in socket.channels) {
      part(channel);
    }
    console.log("[" + socket.id + "] disconnected");
    delete sockets[socket.id];
  });

  socket.on("join-room", function (config) {
    if (config) {
      channel = config.channel;
      const { userID, userdata } = config;
      const { name } = userdata;

      if (channel in socket.channels) {
        console.log("[" + socket.id + "] ERROR: already joined ", channel);
        return;
      }
      if (!(channel in channels)) {
        channels[channel] = {};
      }
      for (id in channels[channel]) {
        channels[channel][id].emit("addPeer-room", {
          peer_id: socket.id,
          should_create_offer: false,
        });
        socket.emit("addPeer-room", { peer_id: id, should_create_offer: true });
        console.log("What is this id => ", id);
      }
      console.log(name, " joining room", config.channel);
      socket.join(config.channel);
      socket.broadcast.in(config.channel).emit("room-users", config);
      channels[channel][socket.id] = socket;
      socket.channels[channel] = channel;
    }
  });

  function part(channel) {
    console.log("[" + socket.id + "] part ");
    if (!(channel in socket.channels)) {
      console.log("[" + socket.id + "] ERROR: not in ", channel);
      return;
    }
    delete socket.channels[channel];
    delete channels[channel][socket.id];
    for (id in channels[channel]) {
      channels[channel][id].emit("removePeer", { peer_id: socket.id });
      socket.emit("removePeer", { peer_id: id });
    }
  }

  socket.on("part", part);

  socket.on("relayICECandidate-room", function (config) {
    const peer_id = config.peer_id;
    const ice_candidate = config.ice_candidate;
    console.log(
      "[" + socket.id + "] relaying ICE candidate to [" + peer_id + "] ",
      ice_candidate
    );
    if (peer_id in sockets) {
      sockets[peer_id].emit("iceCandidate-room", {
        peer_id: socket.id,
        ice_candidate: ice_candidate,
      });
    }
  });

  socket.on("relaySessionDescription-room", function (config) {
    var peer_id = config.peer_id;
    var session_description = config.session_description;
    console.log(
      "[" + socket.id + "] relaying session description to [" + peer_id + "] ",
      session_description
    );
    if (peer_id in sockets) {
      sockets[peer_id].emit("sessionDescription-room", {
        peer_id: socket.id,
        session_description: session_description,
      });
    }
  });

  // this for  file  transfer
  socket.on("file-send-room", function (file) {
    // console.log(file);
    socket.to(channel).emit("file-out-room", file);
  });

  socket.on("file-send-room-result", function (file) {
    // console.log(file);
    socket.to(channel).emit("file-out-room-result", file);
  });
});
