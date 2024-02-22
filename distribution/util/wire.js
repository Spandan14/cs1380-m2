const {DEFAULT_CALLBACK} = require('../local/local');
const local = require('../local/local');

function createRPC(func) {
  if (!local.hasOwnProperty('rpcService')) {
    local.rpcService = {};
  }
  const funcID = `<rpc> #${local.rpcService.length}`;
  local['rpcService'][funcID] = func;

  // Write some code...
  return function(...args) {
    const callback = args.pop() || DEFAULT_CALLBACK;

    var remote = {node: global.config, service: 'rpcService',
      method: funcID};

    local.comm.send(args, remote, callback);
  };
}

/*
    The toAsync function converts a synchronous function that returns a value
    to one that takes a callback as its last argument and returns the value
    to the callback.
*/
function toAsync(func) {
  return function(...args) {
    const callback = args.pop() || function() {};
    try {
      const result = func(...args);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  };
}

module.exports = {
  createRPC: createRPC,
  toAsync: toAsync,
};
