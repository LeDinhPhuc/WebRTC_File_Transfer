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

/***/ "./client/src/js/config/index.js":
/*!***************************************!*\
  !*** ./client/src/js/config/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SIGNAL_SERVER\": () => (/* binding */ SIGNAL_SERVER),\n/* harmony export */   \"DATA_SIZES\": () => (/* binding */ DATA_SIZES)\n/* harmony export */ });\nconst DATA_SIZES = {\n  code: 1,\n  contentType: 2,\n  content: 4,\n  peerId: 24,\n  resourceId: 24,\n  startIndex: 4,\n  finishIndex: 4\n};\nconst SIGNAL_SERVER = 'ws://localhost:5000';\n\n\n//# sourceURL=webpack://file-transfer/./client/src/js/config/index.js?");

/***/ }),

/***/ "./client/src/js/index.js":
/*!********************************!*\
  !*** ./client/src/js/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/styles.css */ \"./client/src/css/styles.css\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ \"./client/src/js/config/index.js\");\n\n\nconst ws = new WebSocket(_config__WEBPACK_IMPORTED_MODULE_1__.SIGNAL_SERVER);\nlet peer;\n\nfunction sendMessage(type, data) {\n  console.log('22');\n  if (!ws || !ws.send) return;\n  ws.send(JSON.stringify({\n    type,\n    data\n  }));\n  console.log('22');\n}\n\nws.onopen = function (evt) {\n  peer = {\n    name: 'Hello'\n  };\n  sendMessage('online', {\n    peer\n  });\n};\n\nws.onmessage = function (evt) {\n  const {\n    type,\n    data\n  } = JSON.parse(evt.data);\n  console.log('type ', type, ' ', data);\n\n  switch (type) {\n    case 'online':\n      handleOnline(data);\n      break;\n\n    case 'newPeer':\n      handleNewPeer(data);\n      break;\n\n    case 'offer':\n      handleOffer(data);\n      break;\n\n    case 'answer':\n      handleAnswer(data);\n      break;\n\n    case 'candidate':\n      handleCandidate(data);\n      break;\n\n    case 'leave':\n      handleLeave(data);\n      break;\n\n    default:\n      console.log(`Message ${type} is not support`);\n  }\n};\n\nws.onclose = function (reason) {// sendMessage('leave', { peerId: ' peer.peerId ' });\n};\n\nws.onerror = function (reason) {// console.log('WS is error: Reason ', reason);\n};\n\nfunction handleOnline(data) {// peers = data.peers;\n  // peer.peerId = data.peerId;\n}\n\nfunction handleNewPeer(data) {// peers.push(data.newPeer);\n}\n\nasync function handleOffer(data) {// await peerConnection.setRemoteDescription(data.desc);\n  // receiverId = data.senderId;\n  // try {\n  //   const answer = await peerConnection.createAnswer();\n  //   await peerConnection.setLocalDescription(answer);\n  //   sendMessage('answer', { desc: answer, receiverId });\n  // } catch (err) {\n  //   onCreateSessionDescriptionError(err);\n  // }\n}\n\nasync function handleAnswer(data) {// const { desc } = data;\n  // await peerConnection.setRemoteDescription(desc);\n}\n\nfunction handleCandidate(data) {// const { candidate } = data;\n  // peerConnection\n  //   .addIceCandidate(new RTCIceCandidate(candidate))\n  //   .then(onAddIceCandidateSuccess, onAddIceCandidateError);\n}\n\nfunction handleLeave(data) {// const { peerId } = data;\n  // peers = peers.filter((peer) => peer.peerId !== peerId);\n}\n\nconst startButton = document.querySelector('button#startButton');\nstartButton.addEventListener('click', () => {// createConnection(peers[0]);\n});\nconst sendButton = document.querySelector('button#sendButton');\nsendButton.addEventListener('click', () => {// sendData();\n});\n\n//# sourceURL=webpack://file-transfer/./client/src/js/index.js?");

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