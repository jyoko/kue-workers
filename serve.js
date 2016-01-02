/* serve.js - more testing filler til proper framework set
 *
 * This creates a dumb server on port 3332 with a noop route (both POST & GET),
 * where GET returns immediately with an empty 200 (and logs the request vars)
 * and POST logs the vars, then randomly returns the 'num' var sent to it
 * anywhere between 0-9 seconds after the request is received.
 *
 * Intentionally set request response above default timeout expected by a Worker
 * to catch errors.
 *
 * Also spins up default kue interface on 3333 to watch queue behavior
 */


var kue = require('kue');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var logger = require('./logger');

app.use(bodyParser.json());

app.get('/noop', function(req,res) {
  logger('GET noop: '+JSON.stringify(req.query));
  res.send('');
});

app.post('/noop', function(req,res) {
  logger('From noop: '+JSON.stringify(req.body));
  var rand = (Math.random()*9000)|0;
  setTimeout(function() {
    res.send('got it: '+req.body.num);
  },rand);
});
app.listen(3332);

kue.app.listen(3333);

