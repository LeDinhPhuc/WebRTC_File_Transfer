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

/***/ "./client/src/js/bson.js":
/*!*******************************!*\
  !*** ./client/src/js/bson.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"serialize\": () => (/* binding */ serialize),\n/* harmony export */   \"deserialize\": () => (/* binding */ deserialize)\n/* harmony export */ });\n/* harmony import */ var _bufferHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bufferHandler */ \"./client/src/js/bufferHandler.js\");\n\n\nfunction serialize(cmd = 1, contentLength = 20, content = new ArrayBuffer(8)) {\n  const cmdBuffer = new Uint16Array(_bufferHandler__WEBPACK_IMPORTED_MODULE_0__.default.stringToUint8Array(cmd));\n  const contentLengthBuffer = new Uint32Array(contentLength);\n  const contentBuffer = new ArrayBuffer(content);\n  const data1 = window.bufferHandler.concat(cmdBuffer, contentLengthBuffer);\n  const data2 = window.bufferHandler.concat(data1, contentBuffer);\n  console.log('data2 ', data2);\n}\n\nfunction deserialize(deserialize = 'x') {\n  console.log('deserialize ', deserialize);\n}\n\nconsole.log('bufferHandler ', _bufferHandler__WEBPACK_IMPORTED_MODULE_0__.default);\n\n\n//# sourceURL=webpack://file-transfer/./client/src/js/bson.js?");

/***/ }),

/***/ "./client/src/js/bufferHandler.js":
/*!****************************************!*\
  !*** ./client/src/js/bufferHandler.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nfunction stringToUint8Array(string) {\n  const uint8Array = new TextEncoder().encode(string);\n  return uint8Array;\n}\n\nfunction arrayBufferToString(buffer) {\n  const string = new TextDecoder('utf-8').decode(buffer);\n  return string;\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  stringToUint8Array,\n  arrayBufferToString\n});\n\n//# sourceURL=webpack://file-transfer/./client/src/js/bufferHandler.js?");

/***/ }),

/***/ "./client/src/js/index.js":
/*!********************************!*\
  !*** ./client/src/js/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ \"./client/src/css/styles.css\");\n/* harmony import */ var _bson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bson */ \"./client/src/js/bson.js\");\n\n\nconst SIGNAL_SERVER = 'ws://localhost:5000';\nconst url = window.location.href;\nconst ws = new WebSocket(SIGNAL_SERVER);\nlet peers = [];\nlet peer = null;\nlet receiverId = '';\nlet senderId = '';\nlet peerConnection;\nlet sendChannel;\nlet allowedSendData = false;\nlet receiveChannel;\nlet receiveBuffer = [];\nlet receivedSize = 0;\nlet fileReader;\nlet fileDescription;\nlet bytesPrev = 0;\nlet timestampStart;\nlet timestampPrev;\nlet bitrateMax = 0;\nconst chunkSize = 16384;\nconst fileInput = document.querySelector('input#fileInput');\nfileInput.addEventListener('change', handleFileInputChange, false);\nfileInput.disabled = true;\nconst downloadAnchor = document.querySelector('a#download');\nconst startButton = document.querySelector('button#startButton');\nstartButton.addEventListener('click', () => {\n  createConnection(peers[0]);\n  fileInput.disabled = false;\n});\nconst sendButton = document.querySelector('button#sendButton');\nsendButton.disabled = true;\nsendButton.addEventListener('click', () => {\n  sendData();\n});\nconst closeButton = document.querySelector('button#closeButton');\ncloseButton.disabled = true;\ncloseButton.onclick = closeDataChannels;\n\nfunction handleFileInputChange() {\n  const file = this.files[0];\n\n  if (!file) {\n    console.log('No file chosen');\n  } else {\n    sendButton.disabled = !allowedSendData;\n  }\n}\n\nfunction sendData() {\n  downloadAnchor.textContent = '';\n  const file = fileInput.files[0];\n  const {\n    size,\n    name,\n    type,\n    lastModified\n  } = file;\n  console.log(`File is ${[name, size, type, lastModified].join(' ')}`);\n\n  if (size === 0) {\n    console.log('File is empty, please select a non-empty file');\n    return;\n  }\n\n  const fileDescription = {\n    size,\n    name,\n    type,\n    lastModified\n  };\n  sendChannel.send(JSON.stringify({\n    fileDescription\n  }));\n  fileReader = new FileReader();\n  let offset = 0;\n  fileReader.addEventListener('error', error => console.error('Error reading file:', error));\n  fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));\n  fileReader.addEventListener('load', event => {\n    console.log('FileRead.onload ', event);\n    const {\n      result\n    } = event.target;\n    sendChannel.send(result);\n    offset += result.byteLength;\n    console.log('SendProgress ', (offset / size * 100).toFixed(2) + '%');\n\n    if (offset < size) {\n      readSlice(offset);\n    }\n  });\n\n  const readSlice = o => {\n    console.log('readSlice ', o);\n    const slice = file.slice(offset, o + chunkSize);\n    fileReader.readAsArrayBuffer(slice);\n  };\n\n  readSlice(0);\n  sendButton.disabled = true;\n}\n\nfunction receiveChannelCallback(event) {\n  console.log('\\nReceive Channel Callback: ');\n  receiveChannel = event.channel;\n  receiveChannel.onmessage = onReceiveMessageCallback;\n  receiveChannel.onopen = onReceiveChannelStateChange;\n  receiveChannel.onclose = onReceiveChannelStateChange;\n}\n\nfunction onReceiveMessageCallback(event) {\n  console.log('\\nReceived Message');\n  const {\n    data\n  } = event;\n\n  if (typeof data === 'string') {\n    fileDescription = JSON.parse(data).fileDescription;\n    return;\n  }\n\n  receiveBuffer.push(data);\n  receivedSize += data.byteLength;\n  console.log('receivedSize ', receivedSize);\n\n  if (receivedSize === fileDescription.size) {\n    const received = new Blob(receiveBuffer);\n    receiveBuffer = [];\n    downloadAnchor.href = URL.createObjectURL(received);\n    downloadAnchor.download = fileDescription.name;\n    downloadAnchor.textContent = `Click to download '${fileDescription.name}' (${fileDescription.size} bytes)`;\n    downloadAnchor.style.display = 'block';\n    const bitrate = Math.round(receivedSize * 8 / (new Date().getTime() - timestampStart));\n    console.log(`Average Bitrate: ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`);\n  }\n}\n\nfunction onCreateSessionDescriptionError(error) {\n  console.log('Failed to create session description: ' + error.toString());\n}\n\nfunction onAddIceCandidateSuccess() {\n  console.log('AddIceCandidate success.');\n}\n\nfunction onAddIceCandidateError(error) {\n  console.log(`Failed to add Ice Candidate: ${error.toString()}`);\n}\n\nfunction onSendChannelStateChange() {\n  const readyState = sendChannel.readyState;\n  console.log('Send channel state is: ' + readyState);\n\n  if (readyState === 'open') {\n    allowedSendData = true;\n  } else if (readyState === 'closed') {\n    allowedSendData = false;\n  }\n}\n\nasync function displayStats() {\n  console.log('111111111111');\n\n  if (peerConnection && peerConnection.iceConnectionState === 'connected') {\n    const stats = await peerConnection.getStats();\n    console.log('22222222222 ', stats);\n    let activeCandidatePair;\n    stats.forEach(report => {\n      if (report.type === 'transport') {\n        activeCandidatePair = stats.get(report.selectedCandidatePairId);\n      }\n    });\n\n    if (activeCandidatePair) {\n      if (timestampPrev === activeCandidatePair.timestamp) {\n        return;\n      } // calculate current bitrate\n\n\n      const bytesNow = activeCandidatePair.bytesReceived;\n      const bitrate = Math.round((bytesNow - bytesPrev) * 8 / (activeCandidatePair.timestamp - timestampPrev));\n      console.log(`<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`);\n      timestampPrev = activeCandidatePair.timestamp;\n      bytesPrev = bytesNow;\n      console.log('bitrate ', bitrate);\n\n      if (bitrate > bitrateMax) {\n        bitrateMax = bitrate;\n      }\n    }\n  }\n}\n\nasync function onReceiveChannelStateChange() {\n  const readyState = receiveChannel.readyState;\n  console.log(`Receive channel state is: ${readyState}`);\n\n  if (readyState === 'open') {\n    timestampStart = new Date().getTime();\n    timestampPrev = timestampStart;\n    await displayStats();\n  }\n}\n\nfunction sendMessage(type, data) {\n  if (!ws || !ws.send) return;\n  ws.send(JSON.stringify({\n    type,\n    data\n  }));\n}\n\nif (document.readyState) {\n  peerConnection = new RTCPeerConnection();\n  peerConnection.ondatachannel = receiveChannelCallback;\n  peerConnection.addEventListener('icecandidate', event => {\n    console.log('event.candidate ', event.candidate);\n    if (!event.candidate) return;\n    sendMessage('candidate', {\n      candidate: event.candidate,\n      receiverId\n    });\n  });\n\n  ws.onopen = function (evt) {\n    peer = {\n      name: 'Hello',\n      url\n    };\n    sendMessage('online', {\n      peer\n    });\n  };\n\n  ws.onmessage = function (evt) {\n    const {\n      type,\n      data\n    } = JSON.parse(evt.data);\n\n    switch (type) {\n      case 'online':\n        handleOnline(data);\n        break;\n\n      case 'newPeer':\n        handleNewPeer(data);\n        break;\n\n      case 'offer':\n        handleOffer(data);\n        break;\n\n      case 'answer':\n        handleAnswer(data);\n        break;\n\n      case 'candidate':\n        handleCandidate(data);\n        break;\n\n      case 'leave':\n        handleLeave(data);\n        break;\n\n      default:\n        console.log(`Message ${type} is not support`);\n    }\n  };\n\n  ws.onclose = function (reason) {\n    sendMessage('leave', {\n      peerId: peer.peerId\n    });\n  };\n\n  ws.onerror = function (reason) {\n    console.log('WS is error: Reason ', reason);\n  };\n} // Handle event listener\n\n\nfunction handleOnline(data) {\n  peers = data.peers;\n  peer.peerId = data.peerId;\n}\n\nfunction handleNewPeer(data) {\n  peers.push(data.newPeer);\n}\n\nasync function handleOffer(data) {\n  console.log('offer =>>>>>>>>>>>>>>>>>>>>>>>> ');\n  await peerConnection.setRemoteDescription(data.desc); // client B nhận được gói tin offer sẽ xét id của người gửi đến cho nó thành người mà nó sẽ trả lời nhận\n\n  receiverId = data.senderId;\n\n  try {\n    const answer = await peerConnection.createAnswer();\n    console.log(`Answer from remoteConnection\\n${answer.sdp}`);\n    await peerConnection.setLocalDescription(answer);\n    sendMessage('answer', {\n      desc: answer,\n      receiverId\n    });\n  } catch (err) {\n    onCreateSessionDescriptionError(err);\n  }\n}\n\nasync function handleAnswer(data) {\n  console.log('On answer =>>>>>>>>>>>>>>>>>>>>>>>>');\n  const {\n    desc\n  } = data;\n  await peerConnection.setRemoteDescription(desc);\n}\n\nfunction handleCandidate(data) {\n  const {\n    candidate\n  } = data;\n  console.log('On candidate =>>>>>>>>>>>>>>>>>>>>  ', candidate);\n  peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(onAddIceCandidateSuccess, onAddIceCandidateError);\n}\n\nfunction handleLeave(data) {\n  const {\n    peerId\n  } = data;\n  peers = peers.filter(peer => peer.peerId !== peerId);\n}\n\nasync function createConnection(otherPeer) {\n  if (!otherPeer) return;\n  closeButton.disabled = false;\n  console.log('Created local peer connection object peerConnection');\n  receiverId = otherPeer.peerId;\n  senderId = peer.peerId;\n  sendChannel = peerConnection.createDataChannel('sendDataChannel');\n  console.log('Created send data channel ', sendChannel);\n  sendChannel.onopen = onSendChannelStateChange;\n  sendChannel.onclose = onSendChannelStateChange;\n  sendChannel.addEventListener('error', error => console.error('Error in sendChannel:', error));\n\n  try {\n    const offer = await peerConnection.createOffer();\n    console.log(`Offer from peerConnection\\n${offer.sdp}`);\n    peerConnection.setLocalDescription(offer);\n    sendMessage('offer', {\n      receiverId,\n      desc: offer,\n      senderId\n    });\n  } catch (err) {\n    onCreateSessionDescriptionError(err);\n  }\n\n  closeButton.disabled = false;\n}\n\nfunction closeDataChannels() {\n  console.log('Closing data channels');\n\n  if (sendChannel) {\n    console.log('Closed data channel with label: ' + sendChannel.label);\n    sendChannel.close();\n  }\n\n  if (receiveChannel) {\n    console.log('Closed data channel with label: ' + receiveChannel.label);\n    receiveChannel.close();\n  }\n\n  closeButton.disabled = true;\n}\n\n//# sourceURL=webpack://file-transfer/./client/src/js/index.js?");

/***/ }),

/***/ "./client/src/css/styles.css":
/*!***********************************!*\
  !*** ./client/src/css/styles.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://file-transfer/./client/src/css/styles.css?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
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