const DATA_SIZES = {
  code: 1,
  contentType: 2,
  content: 4,
  peerId: 24,
  resourceId: 24,
  startIndex: 4,
  finishIndex: 4,
};

const SIGNAL_SERVER = 'ws://localhost:5000';

const PEER_CONN_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const DATA_CHANNEL_LABEL = 'sendDataChannel';

export { SIGNAL_SERVER, DATA_SIZES, PEER_CONN_CONFIG, DATA_CHANNEL_LABEL };
