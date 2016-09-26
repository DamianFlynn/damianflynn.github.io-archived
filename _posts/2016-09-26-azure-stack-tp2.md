---
author: Damian Flynn
comments: true
date: 2016-09-26 14:45:00
layout: post
title: "Azure Stack TP2: Ignite Release"
categories: Tutorials
tags:
- Azure
- Azure Stack
- Key Vault
- iDNS
- Software Defined Network
- Storage
---

During the keynote of Ignite 2016, Scott Guthrie has announced the immediate availablity of Azure Stack TP2. Before you being the download of this amazing cloud platform please be sure the check the hardware requirements.

# What is New?
Similar to the Technical Preview 1 release, this is also a Single Server installation, and is fully automated by simply kicking off the included `InstallAzureStack.ps1` script. I do recommend that you start clean, but the script will take you trought the clean up if you wish; Additionally nip over to your Azure Active Directory and delete the old registered applications to keep everything nice and neat!

Under the hood the plumbing has been moved much more into a service fabric for each of the resource providers, and a lot of bugs have been squashed. The portal is much faster, and running a newer release of the Ibiza framework. Of course we have some great fixes to appericate...
* Much better Software Defined Network fabric experience
* Working iDNS services (Yahoo!)

And we also get some nice bonuses this time in the core solution, for example
* Key Vault (Awsome!)
* Storage Queues
* and Lot's more portal improvements, Admin blades, etc.


# Where do I get it?

This 20Gb download is available right now, just follow the link [to Azure Stack TP2](https://azure.microsoft.com/en-us/overview/azure-stack/try/) download site; fill in the details, and go check your server is working well while the package starts downloading.

