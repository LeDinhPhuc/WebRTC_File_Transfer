import convertData from './convertData';
import { CONTENT_TYPES, CODES, DATA_SIZES } from '../config';

function serialize(code, contentType, contentData, senderId) {
  const codeBuf = convertData.zeroPad(
    convertData.num2Buf(code),
    DATA_SIZES.code,
  );

  const contentTypeBuf = convertData.zeroPad(
    convertData.num2Buf(contentType),
    DATA_SIZES.contentType,
  );

  let contentDataBuf;
  switch (contentType) {
    case CONTENT_TYPES.json:
      contentDataBuf = convertData.json2Buf(contentData);
      break;
    case CONTENT_TYPES.string:
      contentDataBuf = convertData.str2Buf(contentData);
      break;
    case CONTENT_TYPES.number:
      contentDataBuf = convertData.num2Buf(contentData);
      break;
    case CONTENT_TYPES.binary:
      if (code === CODES.transfer) {
        contentDataBuf = convertTransferData(contentData);
      } else {
        contentDataBuf = new Uint8Array(contentData);
      }
      break;
    default:
      throw new Error('Code ' + code + ' is not support');
  }

  const contentLengthBuf = convertData.zeroPad(
    convertData.num2Buf(contentDataBuf.byteLength),
    DATA_SIZES.contentLength,
  );

  const senderIdBuf = new Uint8Array(DATA_SIZES.senderId);
  senderIdBuf.set(convertData.str2Buf(senderId), 0);

  return convertData.concatTypedArrays(
    codeBuf,
    contentTypeBuf,
    contentLengthBuf,
    contentDataBuf,
    senderIdBuf,
  );
}

function convertTransferData({ resourceId, startIndex, chunkBuf }) {
  const resourceIdBuf = new Uint8Array(DATA_SIZES.resourceId);
  resourceIdBuf.set(convertData.str2Buf(resourceId), 0);

  const startIndexBuf = convertData.zeroPad(
    convertData.num2Buf(startIndex),
    DATA_SIZES.startIndex,
  );

  chunkBuf = new Uint8Array(chunkBuf);

  return convertData.concatTypedArrays(resourceIdBuf, startIndexBuf, chunkBuf);
}

function deserialize(buffer) {
  let offset = 0;
  const codeBuf = buffer.slice(offset, DATA_SIZES.code);
  const code = convertData.buf2Num(codeBuf);

  offset += DATA_SIZES.code;
  const contentTypeBuf = buffer.slice(offset, offset + DATA_SIZES.contentType);
  const contentType = convertData.buf2Num(contentTypeBuf);

  offset += DATA_SIZES.contentType;
  const contentLengthBuf = buffer.slice(
    offset,
    offset + DATA_SIZES.contentLength,
  );
  const contentLength = convertData.buf2Num(contentLengthBuf);

  offset += DATA_SIZES.contentLength;
  const contentDataBuf = buffer.slice(offset, offset + contentLength);

  offset += contentLength;
  const senderIdBuf = buffer.slice(offset, offset + DATA_SIZES.senderId);
  const senderId = convertData.buf2Str(senderIdBuf);

  let contentData;

  switch (code) {
    case CODES.initResourcesMap:
    case CODES.initResource:
      if (contentType !== CONTENT_TYPES.json) {
        throw new Error('Content type must be json');
      }
      contentData = convertData.buf2JSON(contentDataBuf);
      break;
    case CODES.request:
    case CODES.addResource:
    case CODES.removeResource:
    case CODES.ping:
    case CODES.pong:
    case CODES.transferReady:
      if (contentType !== CONTENT_TYPES.string) {
        throw new Error('Content type must be string');
      }
      contentData = convertData.buf2Str(contentDataBuf);
      break;
    case CODES.transfer:
      if (contentType !== CONTENT_TYPES.binary) {
        throw new Error('Content type must be binary');
      }
      contentData = parseTransferBuf(contentDataBuf);
      break;
    default:
      throw new Error('Code ' + code + ' is not support');
  }
  return { code, contentType, contentLength, contentData, senderId };
}

function parseTransferBuf(contentDataBuf) {
  let offset = 0;
  const resourceIdBuf = contentDataBuf.slice(offset, DATA_SIZES.resourceId);
  const resourceId = convertData.buf2Str(resourceIdBuf);

  offset += DATA_SIZES.resourceId;
  const startIndexBuf = contentDataBuf.slice(
    offset,
    offset + DATA_SIZES.startIndex,
  );
  const startIndex = convertData.buf2Num(startIndexBuf);

  offset += DATA_SIZES.startIndex;
  const chunkBuf = contentDataBuf.slice(offset, contentDataBuf.byteLength);

  return { resourceId, startIndex, chunkBuf };
}

export default { serialize, deserialize };
