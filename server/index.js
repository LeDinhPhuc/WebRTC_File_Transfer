const server = require("http").createServer();
const options = { transports: ["websocket"] };
const io = require("socket.io")(server, options);
server.listen(5000);

let peers = [];

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("online", (data) => {
    const { newPeer } = data;
    socket.join(socket.id);
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

  socket.on("offer", (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    // console.log("answer ", data);
    const { senderId } = data;
    socket.to(senderId).emit("answer", data);
  });

  socket.on("candidate", (data) => {
    console.log("candidate ", data);
    const { receiverId } = data;
    socket.to(receiverId).emit("candidate", data);
  });

  socket.on("candidate2", (data) => {
    const { senderId } = data;
    socket.to(senderId).emit("candidate2", data);
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
