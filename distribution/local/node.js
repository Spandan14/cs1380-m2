const http = require('http');
const serialization = require('../util/serialization');
const local = require('./local');

/*
    The start function will be called to start your node.
    It will take a callback as an argument.
    After your node has booted, you should call the callback.
*/


const start = function(started) {
  const server = http.createServer((req, res) => {
    if (req.method !== 'PUT') {
      res.writeHead(405);
      res.end();
      return;
    }

    const serviceCallback = (e, v) => {
      res.end(serialization.serialize([e, v]));
    };

    var data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      const payload = serialization.deserialize(data);
      const pathTokens = req.url.split('/');
      const service = pathTokens[1];
      var method = pathTokens[2];

      if (service === 'rpcService') {
        method = local.rpcMap.get(method);
        if (!local[service].has(method)) {
          res.write([new Error(`[ERR!] | service: 'rpcService' | 
            method: ${method} not found`), null]);
        } else {
          var result = local[service][method](...payload);
          res.write([null, result]);
        }
      } else {
        local[service][method](...payload, serviceCallback);
      };
    });
  });


  // Write some code...

  /*
    Your server will be listening on the port and ip specified in the config
    You'll need to call the started callback when your server has successfully
    started.

    In this milestone, you'll be passing the server object to this callback
    so that we can close the server when we're done with it.
    In future milestones, we'll add the abilitiy to stop the node
    through the service interface.
  */

  server.listen(global.config.port, global.config.ip, () => {
    started(server);
  });
};

module.exports = {
  start: start,
};


// COMMENTS --------------------------------------------------
/*

  A common pattern in handling HTTP requests in Node.js is to have a
  subroutine that collects all the data chunks belonging to the same
  request. These chunks are aggregated into a body variable.

  When the req.on('end') event is emitted, it signifies that all data from
  the request has been received. Typically, this data is in the form of a
  string. To work with this data in a structured format, it is often parsed
  into a JSON object using JSON.parse(body), provided the data is in JSON
  format.

  Our nodes expect data in JSON format.

*/
