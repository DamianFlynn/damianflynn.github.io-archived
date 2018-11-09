---
layout: post
title: "Foundation laying for a new Home"
date: 2018-10-10 22:15:09
comments: true
description: Laying the foundation for a new home in Azure for a Static Site
categories:
- Announcements
- Developer
- IT Pro/DevOps
- Web
tags:
- MVP
- Cisco Champion
- Community
- OpenSource
- Git / GitHub
- Continuous Deployment
- Azure
- Web Sites
- Cloud
twitter_text: 'Foundation laying for a new Home'
authors: Damian Flynn
---

Hosting my site on Wordpress was not super complex; I leveraged the Azure PaaS Services for Web Apps, and orginally the 3rd party support for hosted MySQL database's. Once I was up and running I quickly realised that all media hosted on the site were landing on the webserver, so a plugin from its marketplace offered the ability to relocate the media to an Azure Blob; offloading some of the challanges.

Hosting this was not free, while I could have leveraged the Free Webserver option it did not take a lot of load for this to be causing some unacceptable performace issues; which when combined with a hosted MySQL service which also was not going to be super fast and was limited in the database size; which became event more of a problem when an attach on the site would result in 1000's of useless comments filling the database to capacity and taking the site down as a direct result.

## Static Site Hosting

Not a lot has to change as we move to the static side model; The web server is still needed to host the side; but the database component is no longer a concern with this approach.

However, The cloud is a beautiful thing, and there are so many more ways to reach you goal, and while we are focused, we can complete a lot more for a lot less!

For this site I have chosen to run a lean cost model, while providing a super responsive experience to you, my readers and subscribers.

## Blob Storage

Using the standard **Azure Blob Storage** offering, I simply copy over the generated HTML site to the account. Assuming the blob is exposed to the public its content is available as a HTTPS endpoint; which simply put is a website.

But, alone this is not enough; why? because how would I address requested for pages which do not exisit for example; I would not want an ugly HTTP 404 error page to be rendered, but instead a nice response to offer a search, navigation, or other more professional experience.

To achieve this I need some HTTP routing options

## Routing around the permiter

It is not hard to find a list of potential solutions in Azure to fill this role; We could use a WebApp, API Managment, or event Azure Functions, or the Azure Functions proxy features. However, we do not actually need to be very creative; as Microsoft have listened to uservoice, MVPs and customers all calling for some better web publishing support for blob storage, especially given AWS have features in thier S3 offer that work simply and effectively.

To this end we will take a look at a feature which at the time of writing is still in preview called **Static Website** (You would have never guessed right!)

All we need do, is set this feature as *Enabled* and define where visitors should be routed to for the *Index Document* and the *Error Document*, and apply the changes. This simple feature makes our site behave just as we would like.

## Re-Enforcing the Foundation

But why stop here, we can go a little further; I want this site to be responsive for you, regardless of where you are located on the planet; afer all we are all embracing the cloud and need to learn and share; so how better to acomplish this, simply leverage another feature from the Azure arsnal of services.

Calling out the *Azure Content Delivery Network* (Azure CDN) we can take advantage, or any one of three platforms 

* Verizon's Global Network
* Akamai CDN Platform
* Microsofts Azure's Footprint

The choice you make here really will come down to what you want in the list of fetures and the budget you have in mind; but for the pupose of this blog; I have for now chosen to run with the option of **Premium Verizon**!

Why? Well It is the most feature rich of the offerings currently, and also the most expensive; which still should not cost me more then 3 or 4 euro a month; which is a lot less than I was paying for my Wordpress site. Give me a month or two and I will share thee exact costs of this solution so you can a