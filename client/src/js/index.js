import '../css/styles.css';
import { SIGNAL_SERVER } from './config';
import Peer from './Peer';

const ws = new WebSocket(SIGNAL_SERVER);
let peer;

function sendMessage(type, data) {
  if (!ws || !ws.send) return;
  ws.send(JSON.stringify({ type, data }));
}

ws.onopen = function (_) {
  peer = new Peer();
  const des = peer.getDescription();
  sendMessage('online', { desc });
};

ws.onmessage = function (evt) {
  const { type, data } = JSON.parse(evt.data);
  switch (type) {
    case 'online':
      handleOnline(data);
      break;
    case 'newPeer':
      handleNewPeer(data);
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
      console.log(`Message ${type} is not support`);
  }
};

ws.onclose = function (reason) {
  // sendMessage('leave', { peerId: ' peer.peerId ' });
};

ws.onerror = function (reason) {
  // console.log('WS is error: Reason ', reason);
};

function handleOnline(data) {
  // peers = data.peers;
  // peer.peerId = data.peerId;
}

function handleNewPeer(data) {
  // peers.push(data.newPeer);
}

async function handleOffer(data) {
  // await peerConnection.setRemoteDescription(data.desc);
  // receiverId = data.senderId;
  // try {
  //   const answer = await peerConnection.createAnswer();
  //   await peerConnection.setLocalDescription(answer);
  //   sendMessage('answer', { desc: answer, receiverId });
  // } catch (err) {
  //   onCreateSessionDescriptionError(err);
  // }
}

async function handleAnswer(data) {
  // const { desc } = data;
  // await peerConnection.setRemoteDescription(desc);
}

function handleCandidate(data) {
  // const { candidate } = data;
  // peerConnection
  //   .addIceCandidate(new RTCIceCandidate(candidate))
  //   .then(onAddIceCandidateSuccess, onAddIceCandidateError);
}

function handleLeave(data) {
  // const { peerId } = data;
  // peers = peers.filter((peer) => peer.peerId !== peerId);
}

const startButton = document.querySelector('button#startButton');
startButton.addEventListener('click', () => {
  // createConnection(peers[0]);
});

const sendButton = document.querySelector('button#sendButton');
sendButton.addEventListener('click', () => {
  // sendData();
});
