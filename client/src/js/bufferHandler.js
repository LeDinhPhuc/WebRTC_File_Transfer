(function (bufferHandler) {
  if (typeof define === 'function' && define.amd) {
    define('bufferHandler', bufferHandler);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = bufferHandler;
  } else {
    const g = window || global || self || this;
    g.bufferHandler = bufferHandler;
  }
})({
  stringToUint8Array: function (string) {
    const uint8Array = new TextEncoder().encode(string);
    return uint8Array;
  },
  arrayBufferToString: function (buffer) {
    const string = new TextDecoder('utf-8').decode(buffer);
    return string;
  },
  deserialize: function (deserialize = 'x') {
    console.log('deserialize ', deserialize);
  },
});
