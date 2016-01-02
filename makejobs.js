/* makejobs.js
 *
 * Example for how to setup a short test,
 * no automated setup in place as of now.
 *
 * Can be used as follows:
 *
 * node makejobs.js [number_of_jobs]
 *
 * Will create N jobs with a finish date randomly chosen
 * in the future, with a title of 'Test job: #' and some
 * dummy data
 */


var kue = require('kue');
var logger = require('./logger');
var queue = kue.createQueue();
var jobs = [];
var j,rand,delay;
var toAdd = process.argv[2]|0 || 10;
var count = 0;
for (var i=0; i<toAdd; i++) {
  rand = (Math.random()*1000*60*5)|0; // 5 mins or less
  delay = new Date(Date.now()+rand); // from now

  // create job with given title (visible in kue UI)
  // and dummy data object
  j = queue.create('kue-workers', {
    title: 'Test job: '+i,
    data: {num: rand, other: 'hello!'}
  // to run at delay time
  }).delay(delay).save((function(i) {
    return function(err) {
      if (!err) logger('Adding job#'+jobs[i].id);
      if (++count===toAdd) process.exit();
    }
  })(i));
  jobs.push(j);
}

