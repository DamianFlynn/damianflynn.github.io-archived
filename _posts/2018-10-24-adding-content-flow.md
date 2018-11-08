---
layout: post
title: "Adding Content Flow"
date: 2018-10-24 21:46:09
comments: true
description: Using pipelines for flow static site content between markdown and foundation
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
twitter_text: 'Adding Static Site Content Flow'
authors: Damian Flynn
image: http://www.virginiafiume.com/wp-content/uploads/2014/10/flow_light-widescreen_wallpapers.jpg
image_url: .
image_credit: Unknown
---

With the heavy lifting done in creating the site building mechanics, and a solid foundation to build and share upon; our final objective is to automate the process of connecting these two stages together.

## Release Pipeline

Technically the goal we are speaking about is the **Release Pipeline** which will take the artifact *(our site .ZIP file)* that we created in the **Build Pipeline** in our pervious topic [Constructing a new Home with Jekyll and Azure DevOps](/Building-The-Site/); and publish this to our storage account.

In simple terms we are going to Unzip the archive to the storage, which is configured to expose the content as a website, and to increase performance we are leveraging a content delivery network.

### Copying Content

As with our *Build Pipeline* there are a few different options on how to accomplish the work. 

> Currently Azure DevOps is not exposing the release pipelines in an *Infrastructure as Code* configuration so we will complete this in the portal.

We begin with a new *Release Pipeline*, add simply add the task **Azure File Copy**, and set the settings similar to the following:

|Setting               | Value |
|---|---|
|Display Name          | Azure Blob File Copy
|Source                | $(System.DefaultWorkingDirectory)/_Jekyll Builder/_site
|Azure Connection Type | Azure Resource Manager
|Azure Subscription    | My Azure Subscription
|Destination Type      | Azure Blob
|Storage Account       | Name of the Storage Account you created, eg My Blog
|Container Name        | $web


Done!, Seriously; pretty easy right!

### Replace Content

One small issue with the previous approach is that it simple overwrites the content in the blob with the latest version, but it failed to remove any content which might have been removed from the site.

Currently there is no equivalent to the magic *XCOPY* command that will sync the blob removing the data that is no longer required; thats a project for another day.

The quick and dirty fix for this scenario, is first delete the existing content, and then deploy the latest version. This would normally result in a potential outage as the content vanishes for a little time; however we do not have that concern, because we have decided to use a Content Delivery Network which caches our site.

#### Task 1

|Setting               | Value |
|---|---|
|Display Name          | Delete Old Files
|Azure Subscription    | My Azure Subscription
|Script Location       | Inline<br>`az storage blob delete-batch --source $web --account-name $(storageAccount) --output table`

#### Task 2

|Setting               | Value |
|---|---|
|Display Name          | Upload Fresh Content
|Azure Subscription    | My Azure Subscription
|Script Location       | Inline<br>`az storage blob upload-batch --source _site --destination $web --account-name $(storageAccount) --output table --no-progress`

### Tiggers Ready

The last point to consider is *When* should this deployment happen; and thats also pretty obvious when we think about it.

Every time we have a good build of the site, we should check to see which branch just completed the process, and update the relevant site based on this information

![Release Pipeline Flow](/images/posts/2018-10-24/Release-Pipeline-Flow.png)

## Summary

Which flow you choose to implement is totally at your descrission; As I am currently doing a lot of work on the taxonomy of the site; I have impleted the second option of delete and redeploy; but I do in the future plan to come back and optimize this by adding a true sync process which will be far more efficient.
