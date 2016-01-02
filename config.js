/* Configuration file
 *
 */

var config = {

  REDIS_PORT: 	process.env.REDIS_PORT  	|| 6379,
  REDIS_HOST: 	process.env.REDIS_HOST  	|| '127.0.0.1',
  REDIS_AUTH: 	process.env.REDIS_AUTH  	|| false,
  REDIS_URI:  	process.env.REDIS_URI   	|| false,
  REDIS_PREFIX: process.env.REDIS_PREFIX	|| 'q',
  REDIS_DB:     process.env.REDIS_DB      || false,	


  WORKERS:          process.env.KUEWORKERS_WORKERS || 1,
  WORKER_LIFE:      process.env.KUEWORKERS_WORKER_LIFE || Infinity,
  WORKER_KILLTIME:  process.env.KUEWORKERS_WORKER_KILLTIME || 3000,
  JOB_RETRY:         process.env.KUEWORKERS_JOB_RETRY || 10000,

};

var queueOptions = {
  jobEvents: false,
  prefix: config.REDIS_PREFIX,
  redis: {
  }
};
if (config.REDIS_URI) {
  queueOptions.redis.redis = config.REDIS_URI;
} else {
  queueOptions.redis.port =	config.REDIS_PORT;
  queueOptions.redis.host =	config.REDIS_HOST;
  if (config.REDIS_AUTH) {
    queueOptions.redis.auth = config.REDIS_AUTH;
  }
  if (config.REDIS_DB) {
    queueOptions.redis.db = config.REDIS_DB;
  }
}

config.queueOptions = queueOptions;
module.exports = config;
