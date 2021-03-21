import { v4 as uuidv4 } from 'uuid';
import {
  DATA_CHANNEL_LABEL,
  CODES,
  CONTENT_TYPES,
  DATA_SIZES,
  TIME_PER_PING,
  CHUNK_SIZE,
} from './config';
import convertData from './services/convertData';
import parser from './services/parser';
class Peer {
  constructor() {
    this.userAgent = navigator.userAgent;
    this.OTHER_PEERS = []; // [{peerId, peerConnId, dataChannelId}]
    this.PEER_CONNS = {}; // { [peerConnId] : RTCPeerConnection }
    this.DATA_CHANNELS = {}; // { [dataChannelId] : RTCDataChannel }
    this.INTERVALS = {};
    this.RESOURCES_MAP = {}; // {[peerId]: [resourceIds]}
    // MY_RESOURCES =  [{resourceId: uuidv4, data: Blob,name: String,type: String,size: Number}];
    this.MY_RESOURCES = [
      {
        resourceId: uuidv4(),
        data: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        receivedLength: 10,
        desc: {
          name: 'Spilot.txt',
          type: 'text',
          byteLength: 10,
        },
      },
    ];
  }

  init(myPeerId, groupId) {
    this.myPeerId = myPeerId;
    this.groupId = groupId;
  }

  getDescription() {
    return this.userAgent;
  }

  getGroupId() {
    return this.groupId;
  }

  getMyPeerId() {
    return this.myPeerId;
  }

  addPeerConn(peerId, peerConn) {
    const ctx = this;
    const peerConnId = uuidv4();

    const dataChannelId = uuidv4();
    const dataChannel = peerConn.createDataChannel(DATA_CHANNEL_LABEL);

    peerConn.addEventListener('datachannel', (event) => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = (event) => {
        const {
          code,
          contentType,
          contentLength,
          contentData,
          senderId,
        } = parser.deserialize(event.data);
        console.log({ code, contentData });

        switch (code) {
          case CODES.initResourcesMap:
            const resources = contentData;
            ctx.initResourcesMap(senderId, resources);
            contentData[0] && ctx.request(contentData[0]); // FIXME: Test request
            break;
          case CODES.ping:
            const pingMessage = contentData;
            console.log('Ping: ', pingMessage);
            ctx.pong(senderId);
            break;
          case CODES.pong:
            const pongMessage = contentData;
            console.log('Pong: ', pongMessage);
            break;
          case CODES.request:
            ctx.initResource(senderId, contentData);
            break;
          case CODES.initResource:
            if (contentData) {
              ctx.initMyResource(senderId, contentData);
              ctx.transferReady(senderId, contentData.resourceId);
            } else {
              // FIXME: try again or download with http
            }
            break;
          case CODES.transferReady:
            const resourceId = contentData;
            ctx.transferResource(senderId, resourceId);
            break;
          case CODES.transfer:
            ctx.appendResource(contentData);
            break;
          case CODES.addResource:
            ctx.addResource(senderId, contentData);
            break;
          case CODES.removeResource:
            ctx.removeResource(senderId, contentData);
            break;
          default:
            throw new Error('Code ' + code + ' is not support');
        }
      };
    });

    dataChannel.onopen = (_) => {
      ctx.sendInitResources(peerId);

      const interval = setInterval(() => {
        ctx.ping(peerId);
      }, TIME_PER_PING);
      ctx.addInterval(peerId, interval);
    };
    dataChannel.onclose = (_) => {
      ctx.removePeer(peerId);
    };
    dataChannel.onmessage = (event) => {
      console.log('event :', event);
    };

    this.PEER_CONNS[peerConnId] = peerConn;
    this.DATA_CHANNELS[dataChannelId] = dataChannel;
    this.OTHER_PEERS.push({ peerId, peerConnId, dataChannelId });
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

  sendData(peerId, data) {
    const { dataChannelId } = this.getOtherPeer(peerId) || {};
    if (!dataChannelId) return;

    const dataChannel = this.DATA_CHANNELS[dataChannelId];
    const readyState = dataChannel && dataChannel.readyState === 'open';
    readyState && dataChannel.send(data);
  }

  initResourcesMap(peerId, resources) {
    this.RESOURCES_MAP[peerId] = resources || [];
  }

  sendInitResources(peerId) {
    const initResourcesMapData = this.MY_RESOURCES.map(
      (resource) => resource.resourceId,
    );

    const dataBuf = parser.serialize(
      CODES.initResourcesMap,
      CONTENT_TYPES.json,
      initResourcesMapData,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  addInterval(peerId, interval) {
    this.INTERVALS[peerId] = interval;
  }

  clearInterval(peerId) {
    clearInterval(this.INTERVALS[peerId]);
    delete this.INTERVALS[peerId];
  }

  ping(peerId) {
    const dataBuf = parser.serialize(
      CODES.ping,
      CONTENT_TYPES.string,
      `Ping message by ${this.myPeerId}`,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  pong(peerId) {
    const dataBuf = parser.serialize(
      CODES.pong,
      CONTENT_TYPES.string,
      `Pong message by ${this.myPeerId}`,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  findResourceMap(resourceId) {
    const peerIds = Object.keys(this.RESOURCES_MAP);
    for (const peerId of peerIds) {
      if (this.RESOURCES_MAP[peerId].find((elem) => elem === resourceId)) {
        return peerId;
      }
    }
    return null;
  }

  request(resourceId) {
    const peerId = this.findResourceMap(resourceId);

    if (peerId) {
      const dataBuf = parser.serialize(
        CODES.request,
        CONTENT_TYPES.string,
        resourceId,
        this.myPeerId,
      );

      this.sendData(peerId, dataBuf);
      return 1;
    } else {
      //FIXME: download with http
      return 0;
    }
  }

  initResource(peerId, resourceId) {
    const resource = this.MY_RESOURCES.find(
      (resource) => resource.resourceId === resourceId,
    );

    let contentData;
    if (resource) {
      // FIXME: get battery, network speed, ... evaluate ability to serve
      contentData = { resourceId, desc: resource.desc };
    }

    const dataBuf = parser.serialize(
      CODES.initResource,
      CONTENT_TYPES.json,
      contentData,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  initMyResource(peerId, contentData) {
    const { resourceId, desc } = contentData;
    const { byteLength } = desc;
    const newResource = {
      resourceId,
      desc,
      data: new Uint8Array(byteLength),
      receivedLength: 0,
    };
    this.MY_RESOURCES.push(newResource);
  }

  transferReady(peerId, resourceId) {
    const dataBuf = parser.serialize(
      CODES.transferReady,
      CONTENT_TYPES.string,
      resourceId,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  transferResource(peerId, resourceId) {
    const resource = this.MY_RESOURCES.find(
      (resource) => resource.resourceId === resourceId,
    );

    if (!resource) return;
    const {
      data,
      receivedLength,
      desc: { byteLength },
    } = resource;

    if (receivedLength !== byteLength) return;

    const chunkNum = Math.ceil(byteLength / CHUNK_SIZE);
    for (let idx = 0; idx < chunkNum; idx++) {
      const startIndex = idx * CHUNK_SIZE;
      let finishIndex = startIndex + CHUNK_SIZE;
      finishIndex = finishIndex > byteLength ? byteLength : finishIndex;
      const chunkBuf = data.slice(startIndex, finishIndex);

      const contentData = { resourceId, startIndex, chunkBuf };
      this.transfer(peerId, contentData);
    }
  }

  transfer(peerId, contentData) {
    const dataBuf = parser.serialize(
      CODES.transfer,
      CONTENT_TYPES.binary,
      contentData,
      this.myPeerId,
    );

    this.sendData(peerId, dataBuf);
  }

  appendResource({ resourceId, startIndex, chunkBuf }) {
    const resource = this.MY_RESOURCES.find(
      (resource) => resource.resourceId === resourceId,
    );
    if (!resource) return;

    let { data, receivedLength } = resource;
    chunkBuf = new Uint8Array(chunkBuf);
    receivedLength += chunkBuf.byteLength;
    data.set(chunkBuf, startIndex);
    const updatedResource = { ...resource, data, receivedLength };

    if (receivedLength === resource.desc.byteLength) {
      // FIXME: generate file and add url in resource
      console.log('updatedResource ', updatedResource);
    }

    this.MY_RESOURCES = this.MY_RESOURCES.map((elem) =>
      elem.resourceId === resourceId ? updatedResource : elem,
    );
  }

  addResource(peerId, resourceId) {
    const dataBuf = parser.serialize(
      CODES.addResource,
      CONTENT_TYPES.string,
      resourceId,
      this.myPeerId,
    );
    this.sendData(peerId, dataBuf);
  }

  removeResource(peerId, resourceId) {
    const dataBuf = parser.serialize(
      CODES.removeResource,
      CONTENT_TYPES.string,
      resourceId,
      this.myPeerId,
    );
    this.sendData(peerId, dataBuf);
  }

  removePeer(peerId) {
    const otherPeer = this.getOtherPeer(peerId);
    if (!otherPeer) return;

    const { peerConnId, dataChannelId } = otherPeer;

    this.clearInterval(peerId);

    this.DATA_CHANNELS[dataChannelId].close();
    delete this.DATA_CHANNELS[dataChannelId];

    this.PEER_CONNS[peerConnId].close();
    delete this.PEER_CONNS[peerConnId];

    this.OTHER_PEERS = this.OTHER_PEERS.filter(
      (peer) => peer.peerId !== peerId,
    );
  }
}

export default Peer;
