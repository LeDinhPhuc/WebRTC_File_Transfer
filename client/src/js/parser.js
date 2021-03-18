import convertData from './convertData';
import { CONTENT_TYPES, CODES } from './constant';
import { DATA_SIZES } from './config';

function serialize(code, contentType, contentData, peerId) {
  const codeBuf = new Uint8Array(DATA_SIZES.code);
  codeBuf.set(convertData.num2Buf(code), 0);

  let contentDataBuf;
  switch (contentType) {
    case CONTENT_TYPES.json:
      contentDataBuf = convertData.json2Buf(contentData);
      break;
    case CONTENT_TYPES.string:
      contentDataBuf = convertData.str2buf(contentData);
      break;
    case CONTENT_TYPES.number:
      contentDataBuf = convertData.num2Buf(contentData);
      break;
    case CONTENT_TYPES.binary:
      contentDataBuf = new Uint8Array(contentData);
      break;
    default:
      throw new Error('Code ' + code + ' is not support');
  }
  const contentLengthBuf = convertData.zeroPad(
    convertData.num2Buf(contentDataBuf.byteLength),
    DATA_SIZES.content,
  );
  const peerIdBuf = new Uint8Array(DATA_SIZES.peerId);
  peerIdBuf.set(convertData.str2U8Arr(peerId), 0);

  return convertData.concatTypedArrays(
    codeBuf,
    contentType,
    contentLengthBuf,
    contentDataBuf,
    peerIdBuf,
  );
}

function deserialize(buffer) {
  const codeBuf = buffer.slice(0, DATA_SIZES.code);
  const code = convertData.buf2Num(codeBuf);

  const contentTypeStartIndex = DATA_SIZES.code;
  const contentTypeBuf = buffer.slice(
    contentTypeStartIndex,
    DATA_SIZES.contentType,
  );
  const contentType = convertData.buf2Num(contentTypeBuf);

  const contentLengthStartIndex =
    contentTypeStartIndex + DATA_SIZES.contentType;
  const contentLengthBuf = buffer.slice(
    contentLengthStartIndex,
    DATA_SIZES.contentLength,
  );
  const contentLength = convertData.buf2Num(contentLengthBuf);

  const contentDataStartIndex =
    contentLengthStartIndex + DATA_SIZES.contentLength;
  const contentDataBuf = buffer.slice(contentDataStartIndex, contentLength);

  const peerIdStartIndex = contentDataStartIndex + contentLength;
  const peerIdBuf = buffer.slice(peerIdStartIndex, DATA_SIZES.peerId);
  const peerId = convertData.buf2Str(peerIdBuf);

  switch (code) {
    case CODES.initResource:
    case CODES.request:
    case CODES.grant:
    case CODES.addResource:
    case CODES.removeResource:
      const data1 = convertData.buf2JSON(contentDataBuf);
      return { peerId, data1 };
    case CODES.ping:
    case CODES.pong:
      const data2 = convertData.buf2Str(contentDataBuf);
      return { code, peerId, data2 };
    case CODES.transfer:
      let offset = 0;
      const resourceIdBuf = contentDataBuf.slice(offset, DATA_SIZES.resourceId);
      const resourceId = convertData.buf2Str(resourceIdBuf);
      offset += DATA_SIZES.resourceId;

      const startIndexBuf = contentDataBuf.slice(offset, DATA_SIZES.startIndex);
      const startIndex = convertData.buf2Num(startIndexBuf);
      offset += DATA_SIZES.startIndex;

      const finishIndexBuf = contentDataBuf.slice(
        offset,
        DATA_SIZES.finishIndex,
      );
      const finishIndex = convertData.buf2Num(finishIndexBuf);
      offset += DATA_SIZES.finishIndex;

      const dataBuf = contentDataBuf.slice(offset, contentDataBuf.byteLength);
    // FIXME: call func appendData
    default:
      throw new Error('Code ' + code + ' is not support');
  }
}

export { serialize, deserialize };
