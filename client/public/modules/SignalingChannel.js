class SignalingChannel {
  constructor(ws) {
    this.ws = ws;
  }

  addEventListener(eventName, handle) {
    switch (eventName) {
      case "message":
    }
  }

  send = (data) => {
    this.ws.send(data);
  };
}

export { SignalingChannel };
