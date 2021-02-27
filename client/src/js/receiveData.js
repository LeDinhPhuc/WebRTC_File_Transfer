// Universal module definition

(function (receiveData) {
  if (typeof module === 'object' && module.exports)
    module.exports = receiveData;
  else if (typeof define === 'function' && define.amd)
    define('receiveData', receiveData);
  else {
    const g = window || global || self || this;
    g.receiveData = receiveData;
  }
})();
