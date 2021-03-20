/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./client/src/js/Peer.js":
/*!*******************************!*\
  !*** ./client/src/js/Peer.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ \"./node_modules/uuid/dist/esm-browser/v4.js\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ \"./client/src/js/config/index.js\");\n\n\n\nclass Peer {\n  constructor() {\n    this.userAgent = navigator.userAgent;\n    this.OTHER_PEERS = [];\n    this.PEER_CONNS = {};\n    this.DATA_CHANNELS = {};\n    this.resourceMap = {};\n    this.myResource = {};\n  }\n\n  init(peerId, groupId) {\n    this.peerId = peerId;\n    this.groupId = groupId;\n  }\n\n  getDescription() {\n    return this.userAgent;\n  }\n\n  getGroupId() {\n    return this.groupId;\n  }\n\n  getPeerId() {\n    return this.peerId;\n  }\n\n  addPeerConn(peerId, peerConn) {\n    const peerConnId = (0,uuid__WEBPACK_IMPORTED_MODULE_1__.default)();\n    const dataChannelId = (0,uuid__WEBPACK_IMPORTED_MODULE_1__.default)();\n    const dataChannel = peerConn.createDataChannel(_config__WEBPACK_IMPORTED_MODULE_0__.DATA_CHANNEL_LABEL);\n    peerConn.addEventListener('datachannel', event => {\n      const receiveChannel = event.channel;\n\n      receiveChannel.onmessage = event => {\n        const arrayBuffer = event.data;\n        console.log('arrayBuffer ', arrayBuffer);\n      };\n    });\n\n    dataChannel.onopen = event => {};\n\n    dataChannel.onclose = event => {};\n\n    dataChannel.onmessage = event => {\n      console.log('event :', event);\n    };\n\n    this.PEER_CONNS[peerConnId] = peerConn;\n    this.DATA_CHANNELS[dataChannelId] = dataChannel;\n    this.OTHER_PEERS.push({\n      peerId,\n      peerConnId,\n      dataChannelId\n    });\n  }\n\n  onReceiveMessageCallback(event) {\n    const {\n      data\n    } = event;\n    console.log('data ', data);\n    let receiveBuffer = [];\n    receiveBuffer.push(data);\n  }\n\n  getOtherPeer(otherPeerId) {\n    return this.OTHER_PEERS.find(peer => peer.peerId === otherPeerId);\n  }\n\n  getOtherPeers() {\n    return this.OTHER_PEERS;\n  }\n\n  async setRemoteDescription(peerConnId, remoteDesc) {\n    await this.PEER_CONNS[peerConnId].setRemoteDescription(remoteDesc);\n  }\n\n  async addIceCandidate(peerConnId, candidate) {\n    await this.PEER_CONNS[peerConnId].addIceCandidate(new RTCIceCandidate(candidate));\n  }\n\n  request(resourceId) {}\n\n  grant(peerId, description) {}\n\n  transfer(resourceId, data) {}\n\n  updateResource(resourceId) {}\n\n  sendData(peerId, data) {\n    // const { dataChannelId } = this.getOtherPeer(peerId);\n    console.log('this.DATA_CHANNELS ', this.DATA_CHANNELS);\n    const [dataChannelId] = Object.keys(this.DATA_CHANNELS);\n    const dataChannel = this.DATA_CHANNELS[dataChannelId];\n    console.log({\n      dataChannel\n    });\n    const readyState = dataChannel && dataChannel.readyState === 'open';\n    dataChannel.send(data);\n  }\n\n  removePeer(peerId) {\n    const {\n      peerConnId,\n      dataChannelId\n    } = this.getOtherPeer(peerId);\n    this.DATA_CHANNELS[dataChannelId].close();\n    delete this.DATA_CHANNELS[dataChannelId];\n    this.PEER_CONNS[peerConnId].close();\n    delete this.PEER_CONNS[peerConnId];\n  }\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Peer);\n\n//# sourceURL=webpack://file-transfer/./client/src/js/Peer.js?");

/***/ }),

/***/ "./client/src/js/config/index.js":
/*!***************************************!*\
  !*** ./client/src/js/config/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SIGNAL_SERVER\": () => (/* binding */ SIGNAL_SERVER),\n/* harmony export */   \"DATA_SIZES\": () => (/* binding */ DATA_SIZES),\n/* harmony export */   \"PEER_CONN_CONFIG\": () => (/* binding */ PEER_CONN_CONFIG),\n/* harmony export */   \"DATA_CHANNEL_LABEL\": () => (/* binding */ DATA_CHANNEL_LABEL)\n/* harmony export */ });\nconst DATA_SIZES = {\n  code: 1,\n  contentType: 2,\n  content: 4,\n  peerId: 24,\n  resourceId: 24,\n  startIndex: 4,\n  finishIndex: 4\n};\nconst SIGNAL_SERVER = 'ws://localhost:5000';\nconst PEER_CONN_CONFIG = {\n  iceServers: [{\n    urls: 'stun:stun.l.google.com:19302'\n  }]\n};\nconst DATA_CHANNEL_LABEL = 'sendDataChannel';\n\n\n//# sourceURL=webpack://file-transfer/./client/src/js/config/index.js?");

/***/ }),

/***/ "./client/src/js/index.js":
/*!********************************!*\
  !*** ./client/src/js/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ \"./client/src/css/styles.css\");\n/* harmony import */ var _Peer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Peer */ \"./client/src/js/Peer.js\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config */ \"./client/src/js/config/index.js\");\n\n\n\nconst ws = new WebSocket(_config__WEBPACK_IMPORTED_MODULE_2__.SIGNAL_SERVER);\nlet peer = new _Peer__WEBPACK_IMPORTED_MODULE_1__.default();\n\nfunction sendMessage(type, data) {\n  if (!ws || !ws.send) return;\n  ws.send(JSON.stringify({\n    type,\n    data\n  }));\n}\n\nws.onopen = function (_) {\n  const desc = peer.getDescription();\n  sendMessage('online', {\n    desc\n  });\n};\n\nws.onmessage = async function (evt) {\n  const {\n    type,\n    data\n  } = JSON.parse(evt.data);\n\n  switch (type) {\n    case 'online':\n      return handleOnline(data);\n\n    case 'offer':\n      return await handleOffer(data);\n\n    case 'answer':\n      return await handleAnswer(data);\n\n    case 'candidate':\n      return await handleCandidate(data);\n\n    case 'leave':\n      return handleLeave(data);\n\n    default:\n  }\n};\n\nws.onclose = function (reason) {// sendMessage('leave', { peerId: ' peer.peerId ' });\n};\n\nws.onerror = function (reason) {};\n\nfunction handleOnline(data) {\n  const {\n    peerId,\n    group: {\n      groupId,\n      peerIds\n    }\n  } = data;\n  peer.init(peerId, groupId);\n  createConns(peerIds);\n}\n\nfunction createConns(peerIds) {\n  if (!peerIds.length) return;\n  Promise.all(peerIds.map(async receiverId => {\n    const peerConn = new RTCPeerConnection(_config__WEBPACK_IMPORTED_MODULE_2__.PEER_CONN_CONFIG);\n    peer.addPeerConn(receiverId, peerConn);\n    const offer = await peerConn.createOffer();\n    await peerConn.setLocalDescription(offer);\n    const groupId = peer.getGroupId();\n    const senderId = peer.getPeerId();\n    listenerIceCandidate({\n      peerConn,\n      groupId,\n      senderId,\n      receiverId\n    });\n    sendMessage('offer', {\n      groupId,\n      senderId,\n      receiverId,\n      offer\n    });\n  }));\n}\n\nfunction listenerIceCandidate({\n  peerConn,\n  ...rest\n}) {\n  peerConn.addEventListener('icecandidate', event => {\n    if (event.candidate) {\n      sendMessage('candidate', {\n        candidate: event.candidate,\n        ...rest\n      });\n    }\n  });\n}\n\nasync function handleOffer(data) {\n  const {\n    senderId: receiverId,\n    offer\n  } = data;\n  const peerConn = new RTCPeerConnection(_config__WEBPACK_IMPORTED_MODULE_2__.PEER_CONN_CONFIG);\n  peer.addPeerConn(receiverId, peerConn);\n  peerConn.setRemoteDescription(new RTCSessionDescription(offer));\n  const answer = await peerConn.createAnswer();\n  await peerConn.setLocalDescription(answer);\n  const senderId = peer.getPeerId();\n  const groupId = peer.getGroupId();\n  listenerIceCandidate({\n    peerConn,\n    groupId,\n    senderId,\n    receiverId\n  });\n  sendMessage('answer', {\n    groupId,\n    senderId,\n    receiverId,\n    answer\n  });\n}\n\nasync function handleAnswer(data) {\n  const {\n    senderId,\n    answer\n  } = data;\n  const remoteDesc = new RTCSessionDescription(answer);\n  const {\n    peerConnId\n  } = peer.getOtherPeer(senderId);\n  await peer.setRemoteDescription(peerConnId, remoteDesc);\n}\n\nasync function handleCandidate(data) {\n  const {\n    senderId,\n    candidate\n  } = data;\n  const {\n    peerConnId\n  } = peer.getOtherPeer(senderId);\n  await peer.addIceCandidate(peerConnId, candidate);\n}\n\nfunction handleLeave(data) {\n  const {\n    peerId\n  } = data;\n  peer.removePeer(peerId);\n}\n\nconst startButton = document.querySelector('button#startButton');\nstartButton.addEventListener('click', () => {\n  const data = new Uint8Array(2457);\n  peer.sendData('peerId', data);\n});\nconst sendButton = document.querySelector('button#sendButton');\nsendButton.addEventListener('click', () => {// sendData();\n});\n\n//# sourceURL=webpack://file-transfer/./client/src/js/index.js?");

/***/ }),

/***/ "./client/src/css/styles.css":
/*!***********************************!*\
  !*** ./client/src/css/styles.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://file-transfer/./client/src/css/styles.css?");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);\n\n//# sourceURL=webpack://file-transfer/./node_modules/uuid/dist/esm-browser/regex.js?");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ rng)\n/* harmony export */ });\n// Unique ID creation requires a high quality random # generator. In the browser we therefore\n// require the crypto API and do not support built-in fallback to lower quality random number\n// generators (like Math.random()).\nvar getRandomValues;\nvar rnds8 = new Uint8Array(16);\nfunction rng() {\n  // lazy load so that environments that need to polyfill have a chance to do so\n  if (!getRandomValues) {\n    // getRandomValues needs to be invoked in a context where \"this\" is a Crypto implementation. Also,\n    // find the complete implementation of crypto (msCrypto) on IE11.\n    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);\n\n    if (!getRandomValues) {\n      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');\n    }\n  }\n\n  return getRandomValues(rnds8);\n}\n\n//# sourceURL=webpack://file-transfer/./node_modules/uuid/dist/esm-browser/rng.js?");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ \"./node_modules/uuid/dist/esm-browser/validate.js\");\n\n/**\n * Convert array of 16 byte values to UUID string format of the form:\n * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\n */\n\nvar byteToHex = [];\n\nfor (var i = 0; i < 256; ++i) {\n  byteToHex.push((i + 0x100).toString(16).substr(1));\n}\n\nfunction stringify(arr) {\n  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;\n  // Note: Be careful editing this code!  It's been tuned for performance\n  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434\n  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one\n  // of the following:\n  // - One or more input array values don't map to a hex octet (leading to\n  // \"undefined\" in the uuid)\n  // - Invalid input values for the RFC `version` or `variant` fields\n\n  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__.default)(uuid)) {\n    throw TypeError('Stringified UUID is invalid');\n  }\n\n  return uuid;\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);\n\n//# sourceURL=webpack://file-transfer/./node_modules/uuid/dist/esm-browser/stringify.js?");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ \"./node_modules/uuid/dist/esm-browser/rng.js\");\n/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ \"./node_modules/uuid/dist/esm-browser/stringify.js\");\n\n\n\nfunction v4(options, buf, offset) {\n  options = options || {};\n  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`\n\n  rnds[6] = rnds[6] & 0x0f | 0x40;\n  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided\n\n  if (buf) {\n    offset = offset || 0;\n\n    for (var i = 0; i < 16; ++i) {\n      buf[offset + i] = rnds[i];\n    }\n\n    return buf;\n  }\n\n  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.default)(rnds);\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);\n\n//# sourceURL=webpack://file-transfer/./node_modules/uuid/dist/esm-browser/v4.js?");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ \"./node_modules/uuid/dist/esm-browser/regex.js\");\n\n\nfunction validate(uuid) {\n  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__.default.test(uuid);\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);\n\n//# sourceURL=webpack://file-transfer/./node_modules/uuid/dist/esm-browser/validate.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./client/src/js/index.js");
/******/ 	
/******/ })()
;