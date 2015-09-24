---
author: Damian Flynn
comments: true
date: 2015-09-24 15:25:00-0800
layout: post
title: "BitLocker: Automation of Recovery Keys"
categories: Tutorials
tags:
- Active Directory
- PowerShell
-
---

In order to delegate access to BitLocker Recovery Information objects in Active Directory to users that are not a member of the Domain Administrators group, Full Control access must be provided to these users. This can be done by a member of the Domain Administrators group using the Delegation of Control Wizard in the Active Directory Users & Computer console (DSA.MSC).

Use the following procedure to enable access to BitLocker Recovery Information on the Domain level to a group named “BitLocker Admins” in Active Directory:
1.In ActiveDirectory Users & Computers, right click the domain name and select Delegate Control…
2.In the first dialog of the Delegation of Control Wizard, click Next
3.In the Users or Groups dialog, add the group or users for delegation (ie. BitLocker Admins) to the list and click Next
SelectGroup

4.In the Tasks to Delegate dialog, select Create a custom task to delegate and click NextCreateCustomTaskToDelegate
5.In the Active Directory Object Type dialog, select Only the following objects in the folder.
6.In the list select msFVE-RecoveryInformation objects and click Next

DelegateControlofmsFVERecoveryInformation objects
•In the Permissions dialog, select Full Control under Permissions and click Next

DelegatePermissionsFullControl
•Click Finish

Now members of the BitLocker Admins group that are not a member of Domain Admins can read BitLocker Recovery Information in Active Directory.
