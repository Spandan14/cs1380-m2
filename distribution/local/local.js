/* eslint-disable no-unused-vars */
const http = require('http');

const serialization = require('../util/serialization');
const id = require('../util/id');

const node = global.config;


/*

Service  Description                           Methods
status   statusrmation about the current node  get
routes   A mapping from names to functions     get, put
comm     A message communication interface     send

*/
// [SERVICE UTILITIES] --------------------------------------------------------
const DEFAULT_CALLBACK = (e, v) => e ? console.error(e) : console.log(v);
// [SERVICE UTILITIES] --------------------------------------------------------


// [SERVICE] status -----------------------------------------------------------
const NODE_NID = id.getNID(node);
const NODE_SID = id.getSID(node);

const NODE_IP = node.ip;
const NODE_PORT = node.port;

var MESSAGE_COUNT = 0;

const statusGet = (methodName, callback) => {
  if (!callback) {
    callback = DEFAULT_CALLBACK;
  }

  var error;
  var result;

  switch (methodName) {
    case 'nid':
      result = NODE_NID; break;
    case 'sid':
      result = NODE_SID; break;
    case 'ip':
      result = NODE_IP; break;
    case 'port':
      result = NODE_PORT; break;
    case 'counts':
      result = MESSAGE_COUNT; break;
    default:
      error = Error('[ERR!] | service: status | invalid method name');
  }

  MESSAGE_COUNT++;
  callback(error, result);
};

const status = {
  get: statusGet,
};
// [SERVICE] status -----------------------------------------------------------


// [SERVICE] routes -----------------------------------------------------------
var routesMap = new Map();

const routesGet = (methodName, callback) => {
  if (!callback) {
    callback = DEFAULT_CALLBACK;
  }

  var error;
  var result;

  if (routesMap.has(methodName)) {
    result = routesMap.get(methodName);
  } else {
    error = Error('[ERR!] | service: routes | invalid route name');
  }

  MESSAGE_COUNT++;
  callback(error, result);
};

const routesPut = (methodFunction, methodName, callback) => {
  if (!callback) {
    callback = DEFAULT_CALLBACK;
  }

  var error;
  var result;

  if (routesMap.has(methodName)) {
    error = Error('[ERR!] | service: routes | route already exists');
  } else {
    routesMap.set(methodName, methodFunction);
    result = '[INFO] | service: routes | route added';
  }

  MESSAGE_COUNT++;
  callback(error, result);
};

const routes = {
  get: routesGet,
  put: routesPut,
};
// [SERVICE] routes -----------------------------------------------------------


// [SERVICE] comm -------------------------------------------------------------
const commSend = (payload, remote, callback) => {
  if (!callback) {
    callback = DEFAULT_CALLBACK;
  }

  const serialized = serialization.serialize(payload);

  const options = {
    hostname: remote.node.ip,
    port: remote.node.port,
    path: `/${remote.service}/${remote.method}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(serialized),
    },
  };

  const req = http.request(options, (res) => {
    res.setEncoding('utf8');

    var data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const [e, v] = serialization.deserialize(data);
      callback(e, v);
    });
  });

  req.write(serialized);
};

const comm = {
  send: commSend,
};


routesMap.set('status', status);
routesMap.set('routes', routes);
routesMap.set('comm', comm);


module.exports = {
  status: status,
  routes: routes,
  comm: comm,
};
