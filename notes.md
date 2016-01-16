### Config

All configuration can be set manually in `config.js` or through environment variables.

At this time, has the following configuration options (listed with environment var name):

* KUEWORKERS_WORKERS          - Number of workers (default `1`)
* KUEWORKERS_WORKER_LIFE      - TTL of worker (default `Infinity`)
* KUEWORKERS_WORKER_KILLTIME  - Time (in ms) before force-killing worker (default `3000`)
* KUEWORKERS_JOB_RETRY        - Time (in ms) to check and requeue failed jobs (default `10000`)

And for the redis connection:

* REDIS_PORT    - default `6379`
* REDIS_HOST    - default `'127.0.0.1'` 
* REDIS_AUTH    - default `false`, can take string 
* REDIS_URI     - default `false`, can take format: `redis://example.com:1234?redis_opt=val` 
* REDIS_PREFIX  - default `'q'`, can take string 
* REDIS_DB      - default `false`, can take num 

#### Known Issues

* Does not handle redis failures properly (if at all)
* No dynamic resizing

