export default class Peer {
  peerId = undefined;
  connections = {};
  peerConnection = undefined;

  constructor(peerId) {
    this.peerId = peerId;
  }

  createConnection = () => {
    const peerConnection = new RTCPeerConnection();
  };

  addConnection = ({ peerId, connection }) => {};
  removeConnection = (peerId) => {};
  lookup = (dataName) => {};
  sendData = ({ receiverId, data }) => {};
  onReceive = () => {};
  close = () => {
    this.pc = [];
  };
}
