# Kue-Workers

The purpose of this repository is to open-source some of the research done and code written during the creation of a closed-source application.

I'll apologize now that progress isn't moving terribly fast but hopefully someone will find what I dump here useful.

## Overview of Original Application

We needed a flexible, scaleable way to consume a time-ordered queue of jobs and settled upon Kue/Redis. Off the bat we had a few issues, mostly with database connections. The built-in concurrency with Kue creates 2+1 open connections to Redis and we were generating many more getting data from other sources, in addition to the mostly network (not CPU) bound job processing. Working around this limitation led to several concurrency models consisting of various methods of maintaining workers and assorted uses of socket pools (or simply limiting connections).

My work on the project got cut unexpectedly short, so I got permission to open source it.

## Open-Source Progress

Unfortunately most of the code is written as part of a larger application suite and is not suitable to push here directly, so I'm pulling out relevent sections and attempting to organize it more generically.

## Roadmap

* Dumping & filtering code/text
* Organize dump
* Add testing & benchmarking
* Decide best integration plan
