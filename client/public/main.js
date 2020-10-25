"use strict";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const SIGNAL_SERVER = "ws://localhost:5000";
const url = window.location.href;
const options = { transports: ["websocket"] }; // lb
// If you are sure the WebSocket connection will succeed, you can disable the polling transport:
const ws = new WebSocket(SIGNAL_SERVER);
let peers = [];
let peer = null;
let receiverId = "";
let senderId = "";
let peerConnection;
let sendChannel;
let receiveChannel;
let receiveBuffer = [];
let receivedSize = 0;
let fileReader;
let fileDescription;

let bytesPrev = 0;
let timestampStart;
let timestampPrev;
let statsInterval = null;
let bitrateMax = 0;

const fileInput = document.querySelector("input#fileInput");
fileInput.addEventListener("change", handleFileInputChange, false);

const downloadAnchor = document.querySelector("a#download");

const startButton = document.querySelector("button#startButton");
startButton.disabled = true;
startButton.addEventListener("click", () => {
  createConnection(peers[0]);
});

const closeButton = document.querySelector("button#closeButton");
closeButton.disabled = true;
closeButton.onclick = closeDataChannels;

async function handleFileInputChange() {
  const file = fileInput.files[0];
  if (!file) {
    console.log("No file chosen");
  } else {
    startButton.disabled = false;
  }
}

function sendData() {
  const file = fileInput.files[0];
  downloadAnchor.textContent = "";
  const { size, name, type, lastModified } = file;

  console.log(`File is ${[name, size, type, lastModified].join(" ")}`);
  // Handle 0 size files.
  if (size === 0) {
    console.log("File is empty, please select a non-empty file");
    closeDataChannels();
    return;
  }

  const fileDescription = { size, name, type, lastModified };
  sendChannel.send(JSON.stringify({ fileDescription }));

  const chunkSize = 16384;
  fileReader = new FileReader();
  let offset = 0;
  fileReader.addEventListener("error", (error) =>
    console.error("Error reading file:", error)
  );
  fileReader.addEventListener("abort", (event) =>
    console.log("File reading aborted:", event)
  );
  fileReader.addEventListener("load", (e) => {
    console.log("FileRead.onload ", e);
    const { result } = e.target;
    sendChannel.send(result);
    offset += result.byteLength;
    console.log("sendProgress %0.2f %", (offset / size) * 100);
    if (offset < size) {
      readSlice(offset);
    }
  });

  const readSlice = (o) => {
    console.log("readSlice ", o);
    const slice = file.slice(offset, o + chunkSize);
    fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
}

function receiveChannelCallback(event) {
  console.log("\nReceive Channel Callback: ");
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log("\nReceived Message");
  console.log({ event });
  const { data } = event;
  if (typeof data === "string") {
    fileDescription = JSON.parse(data).fileDescription;
    return;
  }

  receiveBuffer.push(data);
  receivedSize += data.byteLength;

  console.log({ receivedSize });
  if (receivedSize === fileDescription.size) {
    clearInterval(statsInterval);
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];

    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = fileDescription.name;
    downloadAnchor.textContent = `Click to download '${fileDescription.name}' (${fileDescription.size} bytes)`;
    downloadAnchor.style.display = "block";

    const bitrate = Math.round(
      (receivedSize * 8) / (new Date().getTime() - timestampStart)
    );
    console.log(
      `Average Bitrate: ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`
    );
    closeDataChannels();
  }
}

function enableStartButton() {
  startButton.disabled = false;
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

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log("Send channel state is: " + readyState);
  if (readyState === "open") {
    sendData(); // FILE TRANSFER
  }
}
async function displayStats() {
  console.log("111111111111");
  if (peerConnection && peerConnection.iceConnectionState === "connected") {
    const stats = await peerConnection.getStats();
    console.log("22222222222 ", stats);
    let activeCandidatePair;
    stats.forEach((report) => {
      if (report.type === "transport") {
        activeCandidatePair = stats.get(report.selectedCandidatePairId);
      }
    });
    if (activeCandidatePair) {
      if (timestampPrev === activeCandidatePair.timestamp) {
        return;
      }
      // calculate current bitrate
      const bytesNow = activeCandidatePair.bytesReceived;
      const bitrate = Math.round(
        ((bytesNow - bytesPrev) * 8) /
          (activeCandidatePair.timestamp - timestampPrev)
      );
      console.log(`<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`);
      timestampPrev = activeCandidatePair.timestamp;
      bytesPrev = bytesNow;
      console.log("bitrate ", bitrate);
      if (bitrate > bitrateMax) {
        bitrateMax = bitrate;
      }
    }
  }
}

async function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
  if (readyState === "open") {
    timestampStart = new Date().getTime();
    timestampPrev = timestampStart;
    statsInterval = setInterval(displayStats, 500);
    await displayStats();
  }
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
          candidate: event.candidate,
          receiverId,
        },
      })
    );
  });

  ws.onopen = function (evt) {
    peer = { name: "Hello", url };
    const onlineMessage = {
      type: "online",
      data: { peer },
    };
    ws.send(JSON.stringify(onlineMessage));
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
        console.log(`Message ${type} is not support`);
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
  await peerConnection.setRemoteDescription(data.desc);
  // client B nhận được gói tin offer sẽ xét id của người gửi đến cho nó thành người mà nó sẽ trả lời nhận
  receiverId = data.senderId;
  try {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

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
const handleAnswer = async (data) => {
  console.log("On answer =>>>>>>>>>>>>>>>>>>>>>>>>");
  const { desc } = data;
  await peerConnection.setRemoteDescription(desc);
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
  closeButton.disabled = false;
  console.log("Created local peer connection object peerConnection");
  receiverId = otherPeer.peerId;
  senderId = peer.peerId;

  sendChannel = peerConnection.createDataChannel("sendDataChannel"); // label
  console.log("Created send data channel ", sendChannel);

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;
  sendChannel.addEventListener("error", (error) =>
    console.error("Error in sendChannel:", error)
  );

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
  closeButton.disabled = true;

  enableStartButton();
}
