"use strict";
import Peer from "./Peer";
const SIGNAL_SERVER = "ws://localhost:5000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const url = window.location.href;
const options = { transports: ["websocket"] }; // lb
// If you are sure the WebSocket connection will succeed, you can disable the polling transport:
const ws = new WebSocket(SIGNAL_SERVER);
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

startButton.addEventListener("click", () => {
  createConnection(peers[0]);
});
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
  peerConnection.ondatachannel = receiveChannelCallback;
  peerConnection.addEventListener("icecandidate", (event) => {
    console.log("event.candidate ", event.candidate);
    if (!event.candidate) return;
    ws.send(
      JSON.stringify({
        type: "candidate",
        data: {
          candidate: event.candidate.toJSON(),
          receiverId,
        },
      })
    );
  });

  ws.onopen = function (evt) {
    peer = { name: "Hello", url };
    const message = {
      type: "online",
      data: { peer },
    };
    ws.send(JSON.stringify(message));
  };

  ws.onmessage = (evt) => {
    const { type, data } = JSON.parse(evt.data);
    switch (type) {
      case "online":
        handleOnline(data);
        break;
      case "newPeer":
        handleNewPeer(data);
        console.log({ peers });
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
        console.log(type);
    }
  };

  ws.onclose = function (evt) {
    const leaveMessage = { type: "leave", data: { peerId: peer.peerId } };
    ws.send(JSON.stringify(leaveMessage));
    ws.send("Leave Phuc");
  };

  ws.onerror = (reason) => {
    console.log("WS is error: Reason ", reason);
  };
}
// Handle event listener
const handleOnline = (data) => {
  peers = data.peers;
  peer.peerId = data.peerId;
};
const handleNewPeer = (data) => {
  peers.push(data.newPeer);
};
const handleOffer = async (data) => {
  console.log("offer =>>>>>>>>>>>>>>>>>>>>>>>> ");
  peerConnection.setRemoteDescription(data.desc);
  // client B nhận được gói tin offer sẽ xét id của người gửi đến cho nó thành người mà nó sẽ trả lời nhận
  receiverId = data.senderId;
  try {
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);

    const answerMessage = {
      type: "answer",
      data: { desc: answer, receiverId },
    };
    ws.send(JSON.stringify(answerMessage));
    console.log(`Answer from remoteConnection\n${answer.sdp}`);
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }
};
const handleAnswer = (data) => {
  console.log("On answer =>>>>>>>>>>>>>>>>>>>>>>>>");
  const { desc } = data;
  peerConnection.setRemoteDescription(desc);
};
const handleCandidate = (data) => {
  const { candidate } = data;
  console.log("On candidate =>>>>>>>>>>>>>>>>>>>>  ", candidate);
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .then(onAddIceCandidateSuccess, onAddIceCandidateError);
};
const handleLeave = (data) => {
  const { peerId } = data;
  peers = peers.filter((peer) => peer.peerId !== peerId);
};

const createConnection = async (otherPeer) => {
  if (!otherPeer) return;
  console.log("Created local peer connection object peerConnection");
  receiverId = otherPeer.peerId;
  senderId = peer.peerId;
  dataChannelSend.placeholder = "";

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  console.log("Created send data channel ", sendChannel);

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  try {
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    console.log(`Offer from peerConnection\n${offer.sdp}`);

    const offerMessage = {
      type: "offer",
      data: { receiverId, desc: offer, senderId },
    };
    ws.send(JSON.stringify(offerMessage));
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }

  startButton.disabled = true;
  closeButton.disabled = false;
};

function closeDataChannels() {
  console.log("Closing data channels");
  if (sendChannel) {
    sendChannel.close();
    console.log("Closed data channel with label: " + sendChannel.label);
  }
  if (receiveChannel) {
    receiveChannel.close();
    console.log("Closed data channel with label: " + receiveChannel.label);
  }
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
