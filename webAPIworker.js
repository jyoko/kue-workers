/* Worker.js
 *
 * Separates worker logic from clock file.
 * Generic web API worker. 
 *
 * This should only _run_ in forked children.
 * Needs some kind of authorization added, using
 * request module for simple additions/modifications
 * including gzip, HTTPS, redirects, etc
 *
 * See Worker.start for full limitations, important notes:
 *  - Only supports GET/POST
 *  - Assumes JSON body for POSTing
 *
 */

var request = require('request');
var log = require('./logger');

// empty initialization, TODO: configuration
var Worker = function() {
};

// Pass the job data needed and when-finished callback
Worker.prototype.start = function(job,done) {
  log('Doing job: '+job.id);

  this.job = job;
  this.done = done;
  
  var reqOpts = {};

  // TODO: validity checks
  reqOpts.url = job.url || 'http://127.0.0.1:3333/noop';
  reqOpts.method = job.method || 'GET';
  reqOpts.headers = job.headers || {};
  reqOpts.timeout = job.timeout || 5000;

  // only handling GET/POST
  if (reqOpts.method==='GET') {
    reqOpts.qs = job.data || {};
  }
  // assuming JSON
  if (reqOpts.method==='POST') {
    reqOpts.json = true;
    reqOpts.body = job.data || {};
  }
  
  this.req = request(reqOpts, this.handleRequest.bind(this));

};

// Simple callback function, passes along error (if any)
// or the statusCode & response body
Worker.prototype.handleRequest = function(err, resp, body) {
  if (err) return this.done(this.job.id,err);
  this.done(this.job.id, null, {code: resp.statusCode,body: body});
};

// Call when killing the worker
Worker.prototype.end = function(cb) {
  // drop pending request
  if (this.req) this.req.abort();
  log('Worker clear, exiting...');
  cb();
};

module.exports = Worker;

