const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const wss = new WebSocket.Server({
  port: 5000,
});

global.GROUPS = {};

// GROUPS = {
//   groupId: {
//     desc: 'description',
//     peers: [
//       {
//         peerId: 'uuidv4',
//         connId: 'uuidv4',
//         desc: 'desc',
//       },
//     ],
//   },
// };

global.CONNS = {};

const sendMessage = (client, type, data) => {
  if (!client) return;
  client.send(JSON.stringify({ type, data }));
};

wss.on('connection', (ws, req) => {
  let groupId, peerId, connId;

  ws.on('message', (evt) => {
    const { type, data } = JSON.parse(evt);

    switch (type) {
      case 'online':
        return handleOnline(data);
      case 'offer':
        return handleOffer(data);
      case 'answer':
        return handleAnswer(data);
      case 'candidate':
        return handleCandidate(data);
      case 'leave':
        return handleLeave(data);
      default:
        break;
    }
  });

  const handleOnline = (data) => {
    const { desc } = data;
    peerId = uuidv4();
    connId = uuidv4();
    CONNS[connId] = ws;
    const newPeer = { peerId, connId, desc };

    // FIXME: query suitable group
    groupId = require('./services/groups').evaluate(desc);

    let otherPeers = [];
    if (groupId) {
      otherPeers = [...require('./services/groups').getGroup(groupId).peers];
      require('./services/groups').addPeer(groupId, newPeer);
    } else {
      groupId = uuidv4();
      require('./services/groups').newGroup(groupId, newPeer);
    }

    sendMessage(ws, 'online', {
      peerId,
      group: {
        groupId,
        peerIds: otherPeers.map((peer) => peer.peerId),
      },
    });
  };

  const handleOffer = (data) => {
    const { groupId, senderId, receiverId, offer } = data;

    const peer = require('./services/groups').getPeer(groupId, receiverId);
    if (!peer) return;
    sendMessage(CONNS[peer.connId], 'offer', { senderId, offer });
  };

  const handleAnswer = (data) => {
    const { groupId, senderId, receiverId, answer } = data;

    const peer = require('./services/groups').getPeer(groupId, receiverId);
    if (!peer) return;
    sendMessage(CONNS[peer.connId], 'answer', { senderId, answer });
  };

  const handleCandidate = (data) => {
    const { groupId, senderId, receiverId, candidate } = data;
    const peer = require('./services/groups').getPeer(groupId, receiverId);

    if (!peer) return;
    sendMessage(CONNS[peer.connId], 'candidate', { senderId, candidate });
  };

  ws.onclose = (reason) => {
    delete CONNS[connId];
    const peers = [...require('./services/groups').removePeer(groupId, peerId)];

    peers.forEach((peer) => {
      sendMessage(CONNS[peer.connId], 'leave', { peerId });
    });
  };
});
