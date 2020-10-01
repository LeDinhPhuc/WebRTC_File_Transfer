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
  console.log(
    "Receive Channel Callback =>>>>!!!!!!!@@@@@@@@@@@@@>>>>>>>>>>>>>>"
  );
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

  socket.on("offer", async (data) => {
    console.log("offer =>>>>>>>>>>>>>>>>>>>>>>>> ");
    const { desc } = data;
    peerConnection.setRemoteDescription(desc);
    // client B nhận được gói tin offer sẽ xét id của người gửi đến cho nó thành người mà nó sẽ trả lời nhận
    receiverId = data.senderId;

    try {
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);
      socket.emit("answer", { desc: answer, receiverId });
      console.log(`Answer from remoteConnection\n${answer.sdp}`);
    } catch (err) {
      onCreateSessionDescriptionError(err);
    }
  });

  socket.on("answer", (data) => {
    console.log("on answer =>>>>>>>>>>>>>>>>>>>>>>>>");
    const { desc } = data;
    peerConnection.setRemoteDescription(desc);
  });

  peerConnection.ondatachannel = receiveChannelCallback;

  peerConnection.addEventListener("icecandidate", (event) => {
    console.log("event.candidate ", event.candidate);
    if (!event.candidate) return;
    socket.emit("candidate", {
      candidate: event.candidate.toJSON(),
      receiverId,
    });
  });

  socket.on("candidate", (data) => {
    const { candidate } = data;
    console.log("On candidate =>>>>>>>>>>>>>>>>>>>>  ", candidate);
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);
  });
}

async function createConnection(otherPeer) {
  if (!otherPeer) return;
  console.log("Created local peer connection object peerConnection");
  const { peerId } = otherPeer;
  receiverId = peerId;
  senderId = peer.peerId;

  dataChannelSend.placeholder = "";

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  console.log("Created send data channel ", sendChannel);

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  try {
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    socket.emit("offer", { receiverId, desc: offer, senderId });
    console.log(`Offer from peerConnection\n${offer.sdp}`);
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }

  startButton.disabled = true;
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
