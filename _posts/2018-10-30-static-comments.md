---
layout: post
title: "Static Comments"
date: 2018-10-30 22:02:19
comments: true
description: Implementing Comments on a Static Site
categories:
- Developer
- IT Pro/DevOps
- Web
tags:
- OpenSource
- Git / GitHub
- Continuous Deployment
- Azure
- Web Sites
- Cloud
twitter_text: 'Implementing #GITHUB Commenting System on #Jekyll'
authors: Damian Flynn
image: https://media.wired.com/photos/59d67aeeb630711f17447691/master/pass/ChatBubbles-758308587.jpg
image_url: .
image_credit: Unknown
---

At this point we are almost ready to go live with our site, however, one of the cornerstones to growing and sharing is communication. 

## Wordpress

In the world of Wordpress, this was a standard core feature, which leveraged the fact that the pages were rendered on demand from a backend database. In this scenario, the same approach is offered to maintain a commenting platform. 

However, as I noted earlier; given that Wordpress powers a very large portion of the blogging surface of the internet; it is an obvious target for hacking, just refer to the CVS database for a glimpse of what this looks like in reality. 

I have had more than over of these exceptions result in defacement or excessive spam in the comment system. The real objective, however, is to bloat the database which will then result in the site going offline as the database reaches its maximum limit based on your host or plan. 

Recovering from this mess is slow and painful, and you must also not ignore the fact that you now should also update the runtime; a process we try to ignore as this exercise generally results in breaking extensions and taking the site offline for a little time. 

## Static Sites

So, if we do not have the luxury of a database to host our comments in the static site configuration (recall all we have is HTML and client-side JavaScript); how on earth do we implement this critical feature. 

Of course, we can use the cloud! There are many SaaS offerings which are designed to integrate into our site but offload all the storage and processing to the service

Additionally, many of these are free to use, if you agree to let the service display a couple of advertisements. Previous I have used services from Disqus on my site to offload the challenges of hosting and keeping updated my own. 

### Disqus Out!

As I coded the liquid for this side I also implemented Disqus as the commentary service. However, immediately after turning this on for my posts the page load time was almost 3 times slower!  

Adding insult to injury the adverts have evolved to be click bate and not relevant to my content what so ever. 

Disqus does offer a *Not Free* option which addressed the Advertising a bit better, but that does not explain why the massive performance hit?

Tracing my site loading time with Chromes F12 development tools expose the shocking truth. 

> Adding Disqus to the site results in over **50** treads to tracking and other undesirable sites 

Therefore I immediately deleted the liquid code and stopped any further integration of this service. It’s gone and good ridden

### Utterance.es

Watching how Microsoft recently replaced their commentary service on the *docs.microsoft.com* sites to leverage GitHub, I decided that this might be a really good solution for this site also.

After a little research, I found a lovely match called **utteranc.es** which requires that you log in with your Github account, and will create a new issue per post in my site, that can be tracked and managed as normal issue comments. 

(I assume based on my content and audience that this should not be a problem - let me know on Twitter if I am wrong about this)