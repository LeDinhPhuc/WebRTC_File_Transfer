import '../css/styles.css';
import Peer from './Peer';

import { SIGNAL_SERVER, PEER_CONN_CONFIG } from './config';

const ws = new WebSocket(SIGNAL_SERVER);
let peer = new Peer();

function sendMessage(type, data) {
  if (!ws || !ws.send) return;
  ws.send(JSON.stringify({ type, data }));
}

ws.onopen = function (_) {
  const desc = peer.getDescription();
  sendMessage('online', { desc });
};

ws.onmessage = async function (evt) {
  const { type, data } = JSON.parse(evt.data);
  switch (type) {
    case 'online':
      return handleOnline(data);
    case 'offer':
      return await handleOffer(data);
    case 'answer':
      return await handleAnswer(data);
    case 'candidate':
      return await handleCandidate(data);
    case 'leave':
      return handleLeave(data);
    default:
  }
};

ws.onclose = function (reason) {
  // sendMessage('leave', { peerId: ' peer.peerId ' });
};

ws.onerror = function (reason) {};

function handleOnline(data) {
  const {
    peerId,
    group: { groupId, peerIds },
  } = data;

  peer.init(peerId, groupId);
  createConns(peerIds);
}

function createConns(peerIds) {
  if (!peerIds.length) return;
  Promise.all(
    peerIds.map(async (receiverId) => {
      const peerConn = new RTCPeerConnection(PEER_CONN_CONFIG);
      peer.addPeerConn(receiverId, peerConn);

      const offer = await peerConn.createOffer();
      await peerConn.setLocalDescription(offer);

      const groupId = peer.getGroupId();
      const senderId = peer.getPeerId();

      listenerIceCandidate({ peerConn, groupId, senderId, receiverId });
      sendMessage('offer', {
        groupId,
        senderId,
        receiverId,
        offer,
      });
    }),
  );
}

function listenerIceCandidate({ peerConn, ...rest }) {
  peerConn.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      sendMessage('candidate', { candidate: event.candidate, ...rest });
    }
  });
}

async function handleOffer(data) {
  const { senderId: receiverId, offer } = data;
  const peerConn = new RTCPeerConnection(PEER_CONN_CONFIG);
  peer.addPeerConn(receiverId, peerConn);

  peerConn.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConn.createAnswer();
  await peerConn.setLocalDescription(answer);

  const senderId = peer.getPeerId();
  const groupId = peer.getGroupId();

  listenerIceCandidate({ peerConn, groupId, senderId, receiverId });
  sendMessage('answer', { groupId, senderId, receiverId, answer });
}

async function handleAnswer(data) {
  const { senderId, answer } = data;
  const remoteDesc = new RTCSessionDescription(answer);
  const { peerConnId } = peer.getOtherPeer(senderId);
  await peer.setRemoteDescription(peerConnId, remoteDesc);
}

async function handleCandidate(data) {
  const { senderId, candidate } = data;
  const { peerConnId } = peer.getOtherPeer(senderId);
  await peer.addIceCandidate(peerConnId, candidate);
}

function handleLeave(data) {
  const { peerId } = data;
  peer.removePeer(peerId);
}

const startButton = document.querySelector('button#startButton');
startButton.addEventListener('click', () => {
  const data = new Uint8Array(2457);
  peer.sendData('peerId', data);
});

const sendButton = document.querySelector('button#sendButton');
sendButton.addEventListener('click', () => {
  // sendData();
});
