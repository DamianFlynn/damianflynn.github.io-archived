---
author: Damian Flynn
comments: true
date: 2015-12-10 09:40:00
layout: post
title: "AD: GUIDs in Base64"
categories: Tutorials
tags:
- PowerShell
- Active Directory
- Base64
- Federation
---

# Base64 GUIDs

Just a short note this time. As I continue to work on multiple federation partners, and configuration endpoints, I continue to see a mix of formats being transmitted when passing GUID style values.

These are appearing as either Base64, or raw GUID; so to assist I created a simple function which would allow me to see the GUIDs from my idP in both formats to assist with debugging.

```PowerShell
Get-ADUser -Filter * -SearchBase "DC=DigiNerve,DC=NET" | select UserPrincipalName, ObjectGUID, 
    @{Label='ObjectGUIDBase64';Expression = {[System.Convert]::ToBase64String(($_.ObjectGUID).ToByteArray())}}
```

This will be very useful as you expose Windows Azure Pack and other Claim aware endpoints to federation partners.
