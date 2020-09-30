"use strict";
const SIGNAL_SERVER = "http://localhost:5000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const url = window.location.href;
const options = { transports: ["websocket"] }; // lb
// If you are sure the WebSocket connection will succeed, you can disable the polling transport:
const socket = io.connect(SIGNAL_SERVER, options);
let _peers = [];
let peer = null;

if (document.readyState) {
  socket.on("connect", () => {
    const socketId = socket.id;
    peer = { name: "Hello", socketId, url, peerId: socketId };
    socket.emit("online", {
      newPeer: peer,
    });
  });
  socket.on("online", (data) => {
    const { peers } = data;
    _peers = peers;
  });
  socket.on("newPeer", (newPeer) => {
    _peers.push(newPeer);
  });
  socket.on("leave", (data) => {
    console.log("leave ", data);
    const { peerId } = data;
    _peers = _peers.filter((peer) => peer.peerId !== peerId);
    console.log({ _peers });
  });

  onOffer();
  onAnswer();
  onCandidate();
}

let peerConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
window.peerConnection = peerConnection = new RTCPeerConnection(ICE_SERVERS);

const dataChannelSend = document.querySelector("textarea#dataChannelSend");
const dataChannelReceive = document.querySelector(
  "textarea#dataChannelReceive"
);
const startButton = document.querySelector("button#startButton");
const sendButton = document.querySelector("button#sendButton");
const closeButton = document.querySelector("button#closeButton");

startButton.onclick = () => {
  createConnection(_peers[0]);
};
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}
function onOffer() {
  socket.on("offer", async (data) => {
    console.log("offer", data);
    const { desc, senderId } = data;
    console.log("peerConnection ", peerConnection);
    if (!peerConnection) return;
    peerConnection.setRemoteDescription(desc);
    try {
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);
      socket.emit("aswer", { desc: answer, senderId });
      console.log(`Answer from remoteConnection\n${answer.sdp}`);
    } catch (err) {
      onCreateSessionDescriptionError(err);
    }
  });
}

function onAnswer() {
  socket.on("answer", (data) => {
    console.log("on answer ");
    const { desc } = data;
    peerConnection.setRemoteDescription(desc);
  });
}

function onCandidate() {
  socket.on("candidate", (data) => {
    const { event, senderId } = data;
    peerConnection
      .addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);
    peerConnection.onicecandidate = (event) => {
      socket.emit("candidate", {
        event,
        receiverId: senderId,
        senderId: peer.peerId,
      });
    };
  });
}

function onCreateSessionDescriptionError(error) {
  console.log("Failed to create session description: " + error.toString());
}

function sendData() {
  const data = dataChannelSend.value;
  sendChannel.send(data);
  console.log("Sent Data: " + data);
}

function onAddIceCandidateSuccess() {
  console.log("AddIceCandidate success.");
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

function receiveChannelCallback(event) {
  console.log("Receive Channel Callback");
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log("Received Message");
  dataChannelReceive.value = event.data;
}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log("Send channel state is: " + readyState);
  if (readyState === "open") {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
}

async function createConnection(otherPeer) {
  dataChannelSend.placeholder = "";
  console.log("Created local peer connection object peerConnection");
  const { peerId } = otherPeer || {};
  const receiverId = peerId;

  console.log("peers", _peers);
  try {
    const offer = await peerConnection.createOffer();
    const senderId = peer.peerId;
    peerConnection.setLocalDescription(offer);

    socket.emit("offer", { receiverId, desc: offer, senderId });
    console.log(`Offer from peerConnection\n${offer.sdp}`);
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }

  peerConnection.onicecandidate = (event) => {
    socket.emit("candidate", { receiverId, event, senderId });
  };

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  console.log("Created send data channel ", sendChannel);

  sendChannel.addEventListener("open", onSendChannelStateChange);
  sendChannel.addEventListener("close", onSendChannelStateChange);
  // sendChannel.onopen = onSendChannelStateChange;
  // sendChannel.onclose = onSendChannelStateChange;

  startButton.disabled = true;
  sendButton.disabled = false;
  closeButton.disabled = false;
}

function closeDataChannels() {
  console.log("Closing data channels");
  sendChannel.close();
  console.log("Closed data channel with label: " + sendChannel.label);
  receiveChannel.close();
  console.log("Closed data channel with label: " + receiveChannel.label);
  peerConnection.close();
  peerConnection = null;
  console.log("Closed peer connections");
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = "";
  dataChannelReceive.value = "";
  dataChannelSend.disabled = true;
  disableSendButton();
  enableStartButton();
}
