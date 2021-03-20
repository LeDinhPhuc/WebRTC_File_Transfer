const { validate: uuidValidate } = require('uuid');

function calcScore(group, condition) {
  //FIXME: calculator score
  return 1;
}

function evaluate(condition) {
  let maxScore = -1;
  let bestGroupId;
  Object.keys(GROUPS).forEach((groupId) => {
    const group = GROUPS[groupId];
    const score = calcScore(group, condition);
    if (score > maxScore) {
      maxScore = score;
      bestGroupId = groupId;
    }
  });
  return bestGroupId;
}

function getGroup(groupId) {
  if (uuidValidate(groupId)) {
    return { ...GROUPS[groupId] };
  }
}

function getPeer(groupId, peerId) {
  if (!uuidValidate(groupId) || !uuidValidate(peerId) || !GROUPS[groupId])
    return null;
  return { ...GROUPS[groupId].peers.find((peer) => peer.peerId === peerId) };
}

function newGroup(groupId, peer) {
  // FIXME: initialize the description based on the description of the first peer
  const { desc } = peer;
  const newGroup = { desc, peers: [peer] };
  GROUPS[groupId] = { ...newGroup };
  return { ...newGroup };
}

function addPeer(groupId, peer) {
  if (GROUPS[groupId]) {
    GROUPS[groupId].peers.push(peer);
    // FIXME: update desc
    const newDesc = GROUPS[groupId].desc;
    GROUPS[groupId].desc = newDesc;
  }

  return { ...GROUPS[groupId] };
}

function removePeer(groupId, peerId) {
  if (!GROUPS[groupId]) return;
  const peers = GROUPS[groupId].peers;
  const peersAfterRemove = peers.filter((peer) => peer.peerId !== peerId);
  GROUPS[groupId].peers = peersAfterRemove;
  return [...peersAfterRemove];
}

module.exports = { getGroup, getPeer, evaluate, newGroup, addPeer, removePeer };
