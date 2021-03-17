const CONTENT_TYPES = {
  string: 'string',
  json: 'json',
  number: 'number',
  binary: 'binary',
};

const CODES = {
  initResource: 0,
  ping: 1,
  pong: 2,
  request: 3,
  grant: 4,
  transfer: 5,
  removeResource: 6,
  addResource: 7,
};

export { CONTENT_TYPES, CODES };
