function num2Buf(num) {
  if (!num) return new ArrayBuffer(0);
  const u8arr = [];
  u8arr.unshift(num & 255);
  while (num >= 256) {
    num = num >>> 8;
    u8arr.unshift(num & 255);
  }
  return new Uint8Array(u8arr);
}

function buf2Num(buf) {
  buf = new Uint8Array(buf);
  let num = 0;
  for (let i = 0; i < buf.byteLength; i++) {
    num += buf[i] << (8 * (buf.byteLength - i - 1));
  }
  return num;
}

function buf2Str(buffer) {
  const string = new TextDecoder('utf-8').decode(buffer);
  return string;
}

function buf2JSON(buf) {
  const stringify = buf2Str(buf);
  return JSON.parse(stringify);
}

function str2Buf(string) {
  const u8Arr = new Uint8Array(new TextEncoder().encode(string));
  return u8Arr;
}

function json2Buf(jsonData) {
  const stringify = JSON.stringify(jsonData);
  const buf = str2Buf(stringify);
  return buf;
}

function zeroPad(buf, length) {
  const result = new Uint8Array(length);
  const offset = length - buf.byteLength;
  result.set(buf, offset);
  return result;
}

function concatTypedArrays(...rest) {
  const reducer = (accumulator, currentBuffer) => {
    const temp = new accumulator.constructor(
      accumulator.length + currentBuffer.length,
    );
    temp.set(accumulator, 0);
    temp.set(currentBuffer, accumulator.length);
    return temp;
  };
  return rest.reduce(reducer);
}

export default {
  num2Buf,
  buf2Num,
  buf2Str,
  buf2JSON,
  str2Buf,
  json2Buf,
  concatTypedArrays,
  zeroPad,
};
