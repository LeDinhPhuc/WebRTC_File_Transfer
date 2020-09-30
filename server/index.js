const server = require("http").createServer();
const options = { transports: ["websocket"] };
const io = require("socket.io")(server, options);
server.listen(5000);

let peers = [];

io.on("connection", (socket) => {
  socket.on("online", (data) => {
    const { newPeer } = data;
    socket.to(socket.id).emit("online", { peers }); // emit event to new connection
    socket.broadcast.emit("newPeer", newPeer); // emit event to other connection
    peers.push(newPeer);
  });

  socket.on("disconnect", (reason) => {
    const index = peers.findIndex((peer) => peer.socketId === socket.id);
    const { peerId } = peers[index];
    socket.broadcast.emit("leave", { peerId });
    peers.splice(index, 1);
  });
});

// online
// login
// join
// offer
// answer
// cadidate
// datachannel
// leave
// disconnect
