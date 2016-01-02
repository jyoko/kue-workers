/* Index.js
 *
 * Queue processor and job handler
 * Specifically maintains minimal connections to reds
 * 
 */

// won't work as-is, customized version of throng in use
// var throng = require('./throng');
var Worker = require('./webAPIworker');
var config = require('./config');
var log = require('./logger');

var WORKERS         = config.WORKERS;
var WORKER_LIFE     = config.WORKER_LIFE;
var WORKER_KILLTIME = config.WORKER_KILLTIME;
var JOB_RETRY       = config.JOB_RETRY;

if (throng.isMaster) {

  var kue = require('kue');
  var queue = kue.createQueue(config.queueOptions);

  var jobs = []; // Stack of unassigned jobs
  var workers = []; // Stack of available workers
  var dones = {}; // used as Map

  /* Sends next available job to
   * first available worker
   */
  var startJob = function(id) {
    // if given a workerID - called from endJob
    if (id!==undefined) {
      if (jobs.length) {
        throng.workers[id].send({job: jobs.shift()});
      } else {
        workers.push(id);
      }
    // without an ID - called from queue consumer
    } else {
      // check we have an ID & job
      if (workers.length && jobs.length) {
        var id = workers.shift();
        throng.workers[id].send({job: jobs.shift()});
      }
    }
  };

  /* morph kueJob to workerJob
   * written async, to allow for other DB calls
   * centralized here, not spread across workers
   */
  var prepareJob = function(kueJob,cb) {
    var workerJob = {
      id: kueJob.id,
      data: kueJob.data.data,
      headers: {},
      url: 'http://127.0.0.1:3332/noop',
      method: (Math.random()<0.5)?'POST':'GET',
    };
    cb(null,workerJob);
  };


  var endJob = function(jobID, err, status) {
    if (err) {
      log('Error with job: '+jobID);
      log('                '+JSON.stringify(err));
      dones[jobID](err);
    } else {
      log('Job '+jobID+' finished with: '+status.code);
      dones[jobID]();
    }
    delete dones[jobID];
  };

  /* Check for stuck active jobs on first load.
   * Current architecture relies on _one_ master queue processor,
   * where an active job at start was abandoned during last run.
   */
  var unstick = (function() {
    var first = true;
    return function() {
      if (first) {
        first = false;
        queue.active(function(err,ids) {
          if (err) return log('Queue error: '+JSON.stringify(err));
          for (var i=0; i<ids.length; i++) {
            kue.Job.get(ids[i], function(err,job) {
              job.inactive();
            });
          }
        });
      }
    };
  })();
  unstick();

  // set timer to periodically retry failed jobs
  var retryFailed = function() {
    queue.failed(function(err, ids) {
      if (err) return log('Queue error: '+JSON.stringify(err));
      for (var i=0; i<ids.length; i++) {
        kue.Job.get(ids[i], function(err, job) {
          job.inactive();
        });
      }
    });
    setTimeout(retryFailed,JOB_RETRY);
  };
  setTimeout(retryFailed,JOB_RETRY);

  queue.process('kue-workers', WORKERS, function(job, done) {
    log('Preparing job: '+job.id);
    dones[job.id] = done;
    prepareJob(job,function(err,job) {
      jobs.push(job);
      startJob();
    });
  });

  var coordinateWorkers = function(msg) {

    if (msg.ready) return startJob(msg.from);
    if (msg.done) {
      endJob(msg.job,msg.err,msg.status);
      startJob(msg.from);
    }

  };

}

var start = function(workerID) {
  log('starting worker '+workerID);

  var worker = new Worker();

  // only run once
  var shutdown = (function() {
    var run = false;
    return function() {
      if (run) return;
      run = true;
      log('stopping worker');
      worker.end(function() {
        process.exit();
      });
    };
  })();

  var finish = function(id,err,status) {
    process.send({done:true,job:id,err:err,status:status,from:workerID});
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('message', function(msg) {
    log('Worker '+workerID+' got job: '+msg.job.id);
    worker.start(msg.job,finish);
  });

  process.send({ready: true, from: workerID});
};

throng(start, {
  workers: WORKERS,
  lifetime: WORKER_LIFE,
  grace: WORKER_KILLTIME,
  messenger: coordinateWorkers
});
