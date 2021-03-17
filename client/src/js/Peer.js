const { request } = require("express");

class Peer(){
  constructor(peerId){
    this.peerId = peerId;
  }
  
  init(){
    this.PEERS = [];
    this.resourceMap = {};
    this.myResource = {};
  }

  request(resourceId){

  }

  grant(peerId, description){

  }

  transfer(resourceId, data){

  }

  updateResource(resourceId, )
}