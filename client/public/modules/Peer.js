class Peer {
  constructor(myId) {
    this.myId = myId;
    this.peerConnection = undefined;
    this.remoteConnection = [];
    this.localConnection = [];
  }

  createConnection = () => {

  };

  addRemoteConnection = ({ peerId, data }) => {
        
  };
  addLocalConnection = ({peerId, data}) => {

  }

  removeConnection = (peerId) => {};
  lookup = (dataName) => {};
  sendData = ({ receiverId, data }) => {};
  onReceive = () => {};
  close = () => {
    this.pc = [];
  };
}

window.Peer = Peer;
