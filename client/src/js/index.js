import '../css/styles.css';
import bson from './parser';

const SIGNAL_SERVER = 'ws://localhost:5000';
const url = window.location.href;

const ws = new WebSocket(SIGNAL_SERVER);
let peers = [];
let peer = null;
let receiverId = '';
let senderId = '';
let peerConnection;
let sendChannel;
let allowedSendData = false;

let receiveChannel;
let receiveBuffer = [];
let receivedSize = 0;
let fileReader;
let fileDescription;

let bytesPrev = 0;
let timestampStart;
let timestampPrev;
let bitrateMax = 0;
const chunkSize = 16384;

const fileInput = document.querySelector('input#fileInput');
fileInput.addEventListener('change', handleFileInputChange, false);
fileInput.disabled = true;

const downloadAnchor = document.querySelector('a#download');

const startButton = document.querySelector('button#startButton');
startButton.addEventListener('click', () => {
  createConnection(peers[0]);
  fileInput.disabled = false;
});

const sendButton = document.querySelector('button#sendButton');
sendButton.disabled = true;
sendButton.addEventListener('click', () => {
  sendData();
});

const closeButton = document.querySelector('button#closeButton');
closeButton.disabled = true;
closeButton.onclick = closeDataChannels;

function handleFileInputChange() {
  const file = this.files[0];
  if (!file) {
    console.log('No file chosen');
  } else {
    sendButton.disabled = !allowedSendData;
  }
}

function sendData() {
  downloadAnchor.textContent = '';
  const file = fileInput.files[0];
  const { size, name, type, lastModified } = file;

  console.log(`File is ${[name, size, type, lastModified].join(' ')}`);
  if (size === 0) {
    console.log('File is empty, please select a non-empty file');
    return;
  }

  const fileDescription = { size, name, type, lastModified };
  sendChannel.send(JSON.stringify({ fileDescription }));

  fileReader = new FileReader();
  let offset = 0;
  fileReader.addEventListener('error', (error) =>
    console.error('Error reading file:', error),
  );
  fileReader.addEventListener('abort', (event) =>
    console.log('File reading aborted:', event),
  );
  fileReader.addEventListener('load', (event) => {
    console.log('FileRead.onload ', event);
    const { result } = event.target;
    sendChannel.send(result);
    offset += result.byteLength;
    console.log('SendProgress ', ((offset / size) * 100).toFixed(2) + '%');
    if (offset < size) {
      readSlice(offset);
    }
  });

  const readSlice = (o) => {
    console.log('readSlice ', o);
    const slice = file.slice(offset, o + chunkSize);
    fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
  sendButton.disabled = true;
}

function receiveChannelCallback(event) {
  console.log('\nReceive Channel Callback: ');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('\nReceived Message');

  const { data } = event;
  if (typeof data === 'string') {
    fileDescription = JSON.parse(data).fileDescription;
    return;
  }

  receiveBuffer.push(data);
  receivedSize += data.byteLength;

  console.log('receivedSize ', receivedSize);
  if (receivedSize === fileDescription.size) {
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];

    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = fileDescription.name;
    downloadAnchor.textContent = `Click to download '${fileDescription.name}' (${fileDescription.size} bytes)`;
    downloadAnchor.style.display = 'block';

    const bitrate = Math.round(
      (receivedSize * 8) / (new Date().getTime() - timestampStart),
    );
    console.log(
      `Average Bitrate: ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`,
    );
  }
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    allowedSendData = true;
  } else if (readyState === 'closed') {
    allowedSendData = false;
  }
}

async function displayStats() {
  console.log('111111111111');
  if (peerConnection && peerConnection.iceConnectionState === 'connected') {
    const stats = await peerConnection.getStats();
    console.log('22222222222 ', stats);
    let activeCandidatePair;
    stats.forEach((report) => {
      if (report.type === 'transport') {
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
          (activeCandidatePair.timestamp - timestampPrev),
      );
      console.log(`<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`);
      timestampPrev = activeCandidatePair.timestamp;
      bytesPrev = bytesNow;
      console.log('bitrate ', bitrate);
      if (bitrate > bitrateMax) {
        bitrateMax = bitrate;
      }
    }
  }
}

async function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
  if (readyState === 'open') {
    timestampStart = new Date().getTime();
    timestampPrev = timestampStart;
    await displayStats();
  }
}

function sendMessage(type, data) {
  if (!ws || !ws.send) return;
  ws.send(JSON.stringify({ type, data }));
}

if (document.readyState) {
  peerConnection = new RTCPeerConnection();
  peerConnection.ondatachannel = receiveChannelCallback;
  peerConnection.addEventListener('icecandidate', (event) => {
    console.log('event.candidate ', event.candidate);
    if (!event.candidate) return;
    sendMessage('candidate', {
      candidate: event.candidate,
      receiverId,
    });
  });

  ws.onopen = function (evt) {
    peer = { name: 'Hello', url };
    sendMessage('online', { peer });
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
    sendMessage('leave', { peerId: peer.peerId });
  };

  ws.onerror = function (reason) {
    console.log('WS is error: Reason ', reason);
  };
}

// Handle event listener
function handleOnline(data) {
  peers = data.peers;
  peer.peerId = data.peerId;
}

function handleNewPeer(data) {
  peers.push(data.newPeer);
}

async function handleOffer(data) {
  console.log('offer =>>>>>>>>>>>>>>>>>>>>>>>> ');
  await peerConnection.setRemoteDescription(data.desc);
  // client B nhận được gói tin offer sẽ xét id của người gửi đến cho nó thành người mà nó sẽ trả lời nhận
  receiverId = data.senderId;
  try {
    const answer = await peerConnection.createAnswer();
    console.log(`Answer from remoteConnection\n${answer.sdp}`);
    await peerConnection.setLocalDescription(answer);
    sendMessage('answer', { desc: answer, receiverId });
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }
}

async function handleAnswer(data) {
  console.log('On answer =>>>>>>>>>>>>>>>>>>>>>>>>');

  const { desc } = data;
  await peerConnection.setRemoteDescription(desc);
}

function handleCandidate(data) {
  const { candidate } = data;
  console.log('On candidate =>>>>>>>>>>>>>>>>>>>>  ', candidate);
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .then(onAddIceCandidateSuccess, onAddIceCandidateError);
}

function handleLeave(data) {
  const { peerId } = data;
  peers = peers.filter((peer) => peer.peerId !== peerId);
}

async function createConnection(otherPeer) {
  if (!otherPeer) return;
  closeButton.disabled = false;
  console.log('Created local peer connection object peerConnection');
  receiverId = otherPeer.peerId;
  senderId = peer.peerId;

  sendChannel = peerConnection.createDataChannel('sendDataChannel');
  console.log('Created send data channel ', sendChannel);

  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;
  sendChannel.addEventListener('error', (error) =>
    console.error('Error in sendChannel:', error),
  );

  try {
    const offer = await peerConnection.createOffer();
    console.log(`Offer from peerConnection\n${offer.sdp}`);
    peerConnection.setLocalDescription(offer);
    sendMessage('offer', { receiverId, desc: offer, senderId });
  } catch (err) {
    onCreateSessionDescriptionError(err);
  }

  closeButton.disabled = false;
}

function closeDataChannels() {
  console.log('Closing data channels');
  if (sendChannel) {
    console.log('Closed data channel with label: ' + sendChannel.label);
    sendChannel.close();
  }
  if (receiveChannel) {
    console.log('Closed data channel with label: ' + receiveChannel.label);
    receiveChannel.close();
  }

  closeButton.disabled = true;
}
