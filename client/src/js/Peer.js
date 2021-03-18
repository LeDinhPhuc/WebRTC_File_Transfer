class Peer {
  constructor(peerId) {
    this.peerId = peerId;
  }

  init() {
    this.peerConns = {};
    this.dataChannels = {};
    this.peers = {};
    this.resourceMap = {};
    this.myResource = {};
  }

  setPeerConns(peerConns) {
    this.peerConns = peerConns;
  }

  getDescription() {
    return { name: 'Peer' };
  }

  request(resourceId) {}

  grant(peerId, description) {}

  transfer(resourceId, data) {}

  updateResource(resourceId) {}
}
