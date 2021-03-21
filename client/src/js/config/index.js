const SIGNAL_SERVER = 'ws://localhost:5000';
const PEER_CONN_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};
const DATA_CHANNEL_LABEL = 'spilot';
const TIME_PER_PING = 180 * 1000;

const CODES = {
  initResourcesMap: 0,
  ping: 1,
  pong: 2,
  request: 3,
  initResource: 4,
  transferReady: 5,
  transfer: 6,
  addResource: 7,
  removeResource: 8,
};
const CONTENT_TYPES = {
  string: 0,
  json: 1,
  number: 2,
  binary: 3,
};
const DATA_SIZES = {
  code: 1,
  contentType: 1,
  contentLength: 4,
  resourceId: 36,
  startIndex: 4,
  senderId: 36,
};

const CHUNK_SIZE = 3;

export {
  SIGNAL_SERVER,
  PEER_CONN_CONFIG,
  DATA_CHANNEL_LABEL,
  CODES,
  CONTENT_TYPES,
  DATA_SIZES,
  TIME_PER_PING,
  CHUNK_SIZE,
};
