function serialize(cmd = 1, contentLength = 20, content = new ArrayBuffer(8)) {
  console.log('window.bufferHandler ', bufferHandler);
  const cmdBuffer = new Uint16Array(bufferHandler.stringToUint8Array(cmd));
  const contentLengthBuffer = new Uint32Array(contentLength);
  const contentBuffer = new ArrayBuffer(content);

  const data1 = window.bufferHandler.concat(cmdBuffer, contentLengthBuffer);
  const data2 = window.bufferHandler.concat(data1, contentBuffer);
  console.log('data2 ', data2);
}
function deserialize(deserialize = 'x') {
  console.log('deserialize ', deserialize);
}

export { serialize, deserialize };
