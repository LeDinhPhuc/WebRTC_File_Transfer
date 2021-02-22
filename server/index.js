const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const wss = new WebSocket.Server({
  port: 5000,
});

let peers = [];

wss.on('connection', (ws, req) => {
  ws.on('message', (evt) => {
    const { type, data } = JSON.parse(evt);
    switch (type) {
      case 'online':
        handleOnline(data);
        break;
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'candidate':
        handleCandidate(data);
        break;
      case 'leave':
        handleLeave(data);
        break;
      default:
        console.log('Not support event ', type);
    }
  });
  const handleOnline = (data) => {
    const peerId = uuidv4();
    const { peer } = data;
    sendMessage(ws, 'online', { peerId, peers });
    const newPeer = { peerId, ...peer };
    peers.forEach((peer) => {
      sendMessage(peer.connection, 'newPeer', { newPeer });
    });
    peers.push({ ...newPeer, connection: ws });
  };
  const handleOffer = (data) => {
    const { receiverId, senderId, desc } = data;
    const receiver = peers.find((peer) => peer.peerId === receiverId);
    if (receiver) {
      sendMessage(receiver.connection, 'offer', { senderId, desc });
    } else {
      console.log('Not found ', receiverId);
    }
  };
  const handleAnswer = (data) => {
    const { receiverId } = data;
    const receiver = peers.find((peer) => peer.peerId === receiverId);
    if (receiver) {
      sendMessage(receiver.connection, 'answer', data);
    } else {
      console.log('Answer event  not found ', receiverId);
    }
  };
  const handleCandidate = (data) => {
    const receiver = peers.find((peer) => peer.peerId === data.receiverId);
    if (receiver) {
      sendMessage(receiver.connection, 'candidate', data);
    } else {
      console.log('Candidate event not found ', receiverId);
    }
  };

  ws.onclose = (reason) => {
    const index = peers.findIndex((peer) => peer.connection === ws);
    const { peerId } = peers[index];
    peers.splice(index, 1);
    peers.forEach((peer) => {
      sendMessage(peer.connection, 'leave', { peerId });
    });
  };
});

const sendMessage = (client, type, data) => {
  if (!client) return;
  client.send(JSON.stringify({ type, data }));
};

// online
// login
// join
// offer
// answer
// candidate
// datachannel
// leave
// disconnect
