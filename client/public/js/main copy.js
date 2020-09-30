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
}

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

const dataChannelSend = document.querySelector("textarea#dataChannelSend");
const dataChannelReceive = document.querySelector(
  "textarea#dataChannelReceive"
);
const startButton = document.querySelector("button#startButton");
const sendButton = document.querySelector("button#sendButton");
const closeButton = document.querySelector("button#closeButton");

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

function createConnection() {
  dataChannelSend.placeholder = "";
  window.localConnection = localConnection = new RTCPeerConnection(ICE_SERVERS);
  console.log("Created local peer connection object localConnection");

  sendChannel = localConnection.createDataChannel("sendDataChannel");
  console.log("Created send data channel");

  localConnection.onicecandidate = (e) => {
    console.log("wwwwwwwwwwwwwwww ", e.candidate);
    onIceCandidate(localConnection, e);
  };
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  window.remoteConnection = remoteConnection = new RTCPeerConnection(
    ICE_SERVERS
  );
  console.log("Created remote peer connection object remoteConnection");

  remoteConnection.onicecandidate = (e) => {
    console.log(" eeee ", e.candidate);
    onIceCandidate(remoteConnection, e);
  };
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection
    .createOffer()
    .then(gotDescription1, onCreateSessionDescriptionError);
  startButton.disabled = true;
  closeButton.disabled = false;
}

function offer() {}

function onCreateSessionDescriptionError(error) {
  console.log("Failed to create session description: " + error.toString());
}

function sendData() {
  const data = dataChannelSend.value;
  sendChannel.send(data);
  console.log("Sent Data: " + data);
}

function closeDataChannels() {
  console.log("Closing data channels");
  sendChannel.close();
  console.log("Closed data channel with label: " + sendChannel.label);
  receiveChannel.close();
  console.log("Closed data channel with label: " + receiveChannel.label);
  localConnection.close();
  remoteConnection.close();
  localConnection = null;
  remoteConnection = null;
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

function gotDescription1(desc) {
  localConnection.setLocalDescription(desc);
  console.log(`Offer from localConnection\n${desc.sdp}`);
  remoteConnection.setRemoteDescription(desc);
  remoteConnection
    .createAnswer()
    .then(gotDescription2, onCreateSessionDescriptionError);
}

function gotDescription2(desc) {
  remoteConnection.setLocalDescription(desc);
  console.log(`Answer from remoteConnection\n${desc.sdp}`);
  localConnection.setRemoteDescription(desc);
}

function getOtherPc(pc) {
  return pc === localConnection ? remoteConnection : localConnection;
}

function getName(pc) {
  return pc === localConnection
    ? "localPeerConnection"
    : "remotePeerConnection";
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(onAddIceCandidateSuccess, onAddIceCandidateError);
  console.log(
    `${getName(pc)} ICE candidate: ${
      event.candidate ? event.candidate.candidate : "(null)"
    }`
  );
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
