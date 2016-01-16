Given that even on a limited-core system, we still see jobs completed about N-times faster given N workers, we don't want to be limited by our database pool. At only 10 workers, 1 master, and the Kue monitor, we can expect to have ~30 connections to redis; if the workers require another database request (eg: to MongoDB for generic job data), that would be a further strain on the shared database. Stepping up to 20, 50, or 100 workers will easily overwhelm the allowed pools in most managed hosting plans.

Given a SIGINT or SIGTERM, close any network connections, kill the workers, then shut itself down. No action is taken on the queue.

#### Job-Specific Notes

is written expecting its jobs are all sending data to an HTTP(S) endpoint, it does operate with some assumptions:

* Hanging active jobs are considered unfinished, are automatically queued to be done ASAP on load
* Failed jobs (by default only a connection error) will be retried at a given interval indefinitely
* Failed logging is offloaded to endpoint
* Completed jobs are never cleared


