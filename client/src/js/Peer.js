import { v4 as uuidv4 } from 'uuid';
import { DATA_CHANNEL_LABEL } from './config';

class Peer {
  constructor() {
    this.userAgent = navigator.userAgent;
    this.OTHER_PEERS = [];
    this.PEER_CONNS = {};
    this.DATA_CHANNELS = {};
    this.resourceMap = {};
    this.myResource = {};
  }

  init(peerId, groupId) {
    this.peerId = peerId;
    this.groupId = groupId;
  }

  getDescription() {
    return this.userAgent;
  }

  getGroupId() {
    return this.groupId;
  }

  getPeerId() {
    return this.peerId;
  }

  addPeerConn(peerId, peerConn) {
    const peerConnId = uuidv4();

    const dataChannelId = uuidv4();
    const dataChannel = peerConn.createDataChannel(DATA_CHANNEL_LABEL);

    peerConn.addEventListener('datachannel', (event) => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = (event) => {
        const arrayBuffer = event.data;
        console.log('arrayBuffer ', arrayBuffer);
      };
    });

    dataChannel.onopen = (event) => {};
    dataChannel.onclose = (event) => {};
    dataChannel.onmessage = (event) => {
      console.log('event :', event);
    };

    this.PEER_CONNS[peerConnId] = peerConn;
    this.DATA_CHANNELS[dataChannelId] = dataChannel;
    this.OTHER_PEERS.push({ peerId, peerConnId, dataChannelId });
  }

  onReceiveMessageCallback(event) {
    const { data } = event;
    console.log('data ', data);
    let receiveBuffer = [];
    receiveBuffer.push(data);
  }

  getOtherPeer(otherPeerId) {
    return this.OTHER_PEERS.find((peer) => peer.peerId === otherPeerId);
  }

  getOtherPeers() {
    return this.OTHER_PEERS;
  }

  async setRemoteDescription(peerConnId, remoteDesc) {
    await this.PEER_CONNS[peerConnId].setRemoteDescription(remoteDesc);
  }

  async addIceCandidate(peerConnId, candidate) {
    await this.PEER_CONNS[peerConnId].addIceCandidate(
      new RTCIceCandidate(candidate),
    );
  }

  request(resourceId) {}

  grant(peerId, description) {}

  transfer(resourceId, data) {}

  updateResource(resourceId) {}

  sendData(peerId, data) {
    // const { dataChannelId } = this.getOtherPeer(peerId);
    console.log('this.DATA_CHANNELS ', this.DATA_CHANNELS);
    const [dataChannelId] = Object.keys(this.DATA_CHANNELS);
    const dataChannel = this.DATA_CHANNELS[dataChannelId];
    console.log({ dataChannel });
    const readyState = dataChannel && dataChannel.readyState === 'open';
    dataChannel.send(data);
  }

  removePeer(peerId) {
    const { peerConnId, dataChannelId } = this.getOtherPeer(peerId);

    this.DATA_CHANNELS[dataChannelId].close();
    delete this.DATA_CHANNELS[dataChannelId];

    this.PEER_CONNS[peerConnId].close();
    delete this.PEER_CONNS[peerConnId];
  }
}

export default Peer;
