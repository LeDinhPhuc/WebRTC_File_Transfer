"use strict";
const SIGNAL_SERVER = "http://localhost:5000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const url = window.location.href;
const options = { transports: ["websocket"] }; // lb
// If you are sure the WebSocket connection will succeed, you can disable the polling transport:
const socket = io.connect(SIGNAL_SERVER, options);
let peers = [];
let peer = null;
let receiverId = "";
let senderId = "";

let peerConnection;
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

startButton.onclick = () => {
  createConnection(peers[0]);
};
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

function onCreateSessionDescriptionError(error) {
  console.log("Failed to create session description: " + error.toString());
}

function onAddIceCandidateSuccess() {
  console.log("AddIceCandidate success.");
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}
function sendData() {
  const data = dataChannelSend.value;
  sendChannel.send(data);
  console.log("Sent Data: " + data);
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

// js ready
if (document.readyState) {
  peerConnection = new RTCPeerConnection();

  socket.on("connect", () => {
    const socketId = socket.id;
    peer = { name: "Hello", socketId, url, peerId: socketId };
    socket.emit("online", {
      newPeer: peer,
    });
  });

  socket.on("online", (data) => {
    peers = data.peers;
    // console.log({ peers });
  });

  socket.on("newPeer", (newPeer) => {
    peers.push(newPeer);
  });

  socket.on("leave", (data) => {
    console.log("leave ", data);
    const { peerId } = data;
    peers = peers.filter((peer) => peer.peerId !== peerId);
    console.log({ peers });
  });
  socket.on("candidate2", (data) => {
    const { event, senderId, receiverId } = data;
    peerConnection.addIceCandidate(event.candidate);
    // sendChannel = peerConnection.createDataChannel("sendDataChannel");
    // console.log("Created send data channel ", sendChannel);
    // sendChannel.addEventListener("open", onSendChannelStateChange);
    // sendChannel.addEventListener("close", onSendChannelStateChange);
  });
  peerConnection.addEventListener("icecandidate", (event) => {
    console.log("event.candidate ", event.candidate);
    if (!event.candidate) return;
    socket.emit("candidate", {
      candidate: event.candidate,
      receiverId,
      senderId,
    });
  });

  socket.on("candidate", (data) => {
    console.log("on candidate =>>>>>>>>>>>>>>>>>>>>  ", data);
    const { candidate, senderId, receiverId } = data;
    const candi = new RTCIceCandidate(candidate);
    console.log("Candidate Obj: ", candi);
    peerConnection
      .addIceCandidate(candi)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);

    peerConnection.ondatachannel = receiveChannelCallback;
  });

  socket.on("answer", (data) => {
    console.log("on answer =>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log("peerConnection ", peerConnection);
    const { desc, receiverId, senderId } = data;
    peerConnection.setRemoteDescription(desc);

    // peerConnection.onicecandidate = (event) => {
    //   console.log("event.candidate ", event.candidate);
    //   socket.emit("candidate1", { event, receiverId, senderId });
    // };
  });

  socket.on("offer", async (data) => {
    const { desc, senderId } = data;
    peerConnection.setRemoteDescription(desc);
    receiverId = data.receiverId;
    console.log("offer =>>>>>>>>>>>>>>>>>>>>>>>>", peerConnection);
    try {
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);
      socket.emit("answer", { desc: answer, senderId, receiverId });
      console.log(`Answer from remoteConnection\n${answer.sdp}`);
    } catch (err) {
      onCreateSessionDescriptionError(err);
    }
  });
}

async function createConnection(otherPeer) {
  dataChannelSend.placeholder = "";
  console.log("Created local peer connection object peerConnection");
  const { peerId } = otherPeer || {};
  receiverId = peerId;
  senderId = peer.peerId;
  console.log("peers", peers);

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  console.log("Created send data channel ", sendChannel);
  sendChannel.addEventListener("open", onSendChannelStateChange);
  sendChannel.addEventListener("close", onSendChannelStateChange);

  try {
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    // socket.emit("offer", { receiverId, desc: offer, senderId });
    console.log(`Offer from peerConnection\n${offer.sdp}`);
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }

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
