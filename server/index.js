const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const wss = new WebSocket.Server({
  port: 5000,
});

let peers = [];

wss.on("connection", function connection(ws, req) {
  ws.on("message", (evt) => {
    const { type, data } = JSON.parse(evt);
    switch (type) {
      case "online":
        handleOnline(data);
        break;
      case "offer":
        handleOffer(data);
        break;
      case "answer":
        handleAnswer(data);
        break;
      case "candidate":
        handleCandidate(data);
        break;
      case "leave":
        handleLeave(data);
        break;
      default:
        console.log("Not support event ", type);
    }
  });
  const handleOnline = (data) => {
    // console.log("online");
    const peerId = uuidv4();
    const { peer } = data;
    ws.send(JSON.stringify({ type: "online", data: { peerId, peers } }));
    const newPeer = { peerId, ...peer };
    peers.forEach((peer) => {
      peer.connection.send(
        JSON.stringify({ type: "newPeer", data: { newPeer } })
      );
    });
    peers.push({ ...newPeer, connection: ws });
  };
  const handleOffer = (data) => {
    // console.log("offer:");
    const { receiverId, senderId, desc } = data;
    const receiver = peers.find((peer) => peer.peerId === receiverId);
    if (receiver) {
      const offerMessage = { type: "offer", data: { senderId, desc } };
      receiver.connection.send(JSON.stringify(offerMessage));
    } else {
      // console.log("Not found ", receiverId);
    }
  };
  const handleAnswer = (data) => {
    // console.log("answer:");
    const { receiverId } = data;
    const receiver = peers.find((peer) => peer.peerId === receiverId);
    if (receiver) {
      const answerMessage = { type: "answer", data };
      receiver.connection.send(JSON.stringify(answerMessage));
    } else {
      console.log("Answer event  not found ", receiverId);
    }
  };
  const handleCandidate = (data) => {
    // console.log("candidate: ");
    const receiver = peers.find((peer) => peer.peerId === data.receiverId);
    if (receiver) {
      const candidateMessage = { type: "candidate", data };
      receiver.connection.send(JSON.stringify(candidateMessage));
    } else {
      console.log("Candidate event not found ", receiverId);
    }
  };

  ws.onclose = (reason) => {
    const index = peers.findIndex((peer) => peer.connection === ws);
    const { peerId } = peers[index];
    peers.splice(index, 1);
    peers.forEach((peer) => {
      peer.connection.send(JSON.stringify({ type: "leave", data: { peerId } }));
    });
  };
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
