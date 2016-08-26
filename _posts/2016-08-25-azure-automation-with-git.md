---
author: Damian Flynn
comments: true
date: 2016-08-25 10:30:00
layout: post
title: "Azure Automaion: GIT Version Control Integration"
categories: Tutorials
tags:
- SMA
- Automation
- GIT
- OpenSource
---

At Tech-Ed 2014, Ryan Andorfer presented a session, and followed up with a series of blog posts on the 'Building Clouds' blog detailing how to implement a continous deployment version control solution for SMA leveraging a TFS Repository.

Since then a lot of the work we have been implementing with Service Management Automation (SMA) has been version protected using GIT, as it offers a much lighter experience. In this post I am going to introduce you to Ryan's latest integration work, which is an evolution of the original efforts leveraging GIT and Azure Automation. We have many steps to cover, so lets get started.


# GIT Repository

The first step is to ensure you have  [registered an account on GitHub](../2015-11-11-register-a-github-account.md).

We are not going to start from point zero, as that would be simply re-inventing the wheel; instead we are going to make a copy of the great work which Ryan has been working on, an use this as a starting point.

We have two options to choose from in order to get started, which are
1. Forking the Repository
2. Cloning the Repository, to be used as a base for creating a new repository

I will cover both approaches, the Forking option is preferred as it leads to more comunity focus, and allows up to share back any fixes we might add to the solution. However sometimes this is not the focus and the Clone approach may work better.

## Forking ScorchDev

The work we are going to leverage is already published by Ryan in his public GitHub repository which is hosted as [RAndorfer/ScorchDev](https://github.com/randorfer/ScorchDev), or you can also fork from my personal copy as [DamianFlynn/ScorchDev_MMS2016](https://github.com/DamianFlynn/ScorchDev_MMS2016)

We will use one of GitHub's features know as 'Forking' while will crate a copy of the repository in our account. We will take this approach as we will not have write access to Ryan's copy of the repository, and we are going to need to customise the configurations stored in the repository for our environment. If we encounter bugs in the solution, we will also be able to resolve these, and then create a 'Pull' request to have Ryan check the suggested fixes and decide if these should be pulled into the main code.

To Fork the repository, we will follow these steps:
1. Navigate to GitHub.com and Sign In with your account to the service.
2. Next, we will navigate to Ryans repository which is located at [RAndorfer/ScorchDev](https://github.com/randorfer/ScorchDev) or my copy hosted at [DamianFlynn/ScorchDev_MMS2016](https://github.com/DamianFlynn/ScorchDev_MMS2016).
3. With the repository now presented, we will click on the button (currently in the upper left of the screen) labeled as **Fork**
4. GitHub will take you back to your account, where you will now have a copy of the project, and an indicator that this is a fork from the upstream repository.

### Cloning ScorchDev to our Development Station

Now that we have our copy of the ScorchDev repository hosted in our GitHub account, we will need to clone a copy of this locally so we can correctly setup our development workstation.

> Note: Before you proceed you will need to have a copy of Git for Windows installed on your workstation!

1. Create or Navigate to a working folder which we will use as the base for where we are going to clone our repositories to, for example I will use `C:\git` on my system
2. Now, we will clone a copy of the repository and any submodules which it may contain to our workstation using the following command `git clone --recursive https://github.com/damianflynn/ScorchDev`. Of course you will replace my account name 'damianflynn' with your account right!

After a few minutes, we should have a copy of the repository on our machine.

## Clone and Rebase

The alternative approach to forking, is to create a local clone of the repository, and then from there delete the existing ```.git``` file, and initialize a new version of the repository as your new base. 

> Note: Before you proceed you will need to have a copy of Git for Windows installed on your workstation!

### Cloning the repository locally

1. Create or Navigate to a working folder which we will use as the base for where we are going to clone our repositories to, for example I will use `C:\git` on my system
2. Now, we will clone a copy of the repository and any submodules which it may contain to our workstation using the following command `git clone --recursive https://github.com/damianflynn/ScorchDev_MMS2016 ScorchDev`.

After a few minutes, we should have a copy of the repository on our machine.

### Removing the GIT artifacts

With the repository now local, we will proceed to remove all the Git related artifacts from this copy. This will erase all the history and the relationship which this copy has with the hosted version we just cloned from (commonly refered to as the upstream master)

```powershell
cd c:\git\ScorchDev
del -Recurse -Force .\git\
```

### Initialize a new Instance

Next step is to reinitialize the copy, as a new Git repository. Once this is complete, we can also proceed to create a project in our github account, and push the content back up to this project.

```powershell
git init
```

Using the Web Interface, login to your GitHub account and select the option to **Create a new repository**, this will request some simple details from you, including
1. The *Repository name*, for example 'ScorchDev'
2. A *Description*, for example 'Continous Integation for Azure Automation'
3. Wheather the project should be *Public* or *Private*, which is totally up to your requirements
4. If you wish to *Initialize with a README*, and add a *.gitignore* and/or *license* to the repoisitory, in this case none of these are required as they are part of the copy we are about to push up.

Once this is all in place, we simply click the option to **Create Repository**. This will take a few moments, and you should then see some instructions on how to push your content back up. 

In our case, the example will look similar to the following

```powershell
git remote add origin https://github.com/DamianFlynn/ScorchDev.git
git push -u origin master
```


# Updating our PowerShell Profile

With the local copy of the repository now available, we will proceed to update our PowerShell Profile to automatically load the Local Authoring environment support modules which are included in the repoistory. These will save lots of time, as we proceed to create and debug both runbooks and thier associated assets.

Looking around the content of the repoistory, you will find a folder called `Profile` which contains a sample of the information which we should add to our live profile.

The sample is really in 2 parts,
1. A hash table defining the workspaces (repositories) we will be working with. At minumum we will have 1 workspace which is our **ScorchDev** repository
2. A Loop to process the details in the hashtable, updating our PowerShell profile with pointers to the modules hosted in each of the workspaces.

## The configuration hash table

The mimimum hast table will look similar to the following example, which is an extract from the `profile.ps1` file. Here we can see the name of the workspace (or repoistory) which we are defining, along with some details to how the workspace is organised.

First we are calling the Workspace **SCOrchDev**. Within this Workspace we first define where we cloned the repository to under the variable **Workspace**. The remaining Variables, define the folder name within the repository which will be host for our **Runbooks, Modules, Global Settings** and **Local Development** resources.

```PowerShell
$Global:AutomationWorkspace = @{
    'SCOrchDev' = @{
        'Workspace' = 'C:\GIT\SCOrchDev'
        'ModulePath' = 'PowerShellModules'
        'GlobalPath' = 'Globals'
        'LocalPowerShellModulePath' = 'LocalPowerShellModules'
        'RunbookPath' = 'Runbooks'
    }
}
```
The remaining content of the sample `profile.ps1` file, will process this hast table and update our powershell environment with the relevant paths to publish the contained modules

```powershell
Foreach($_AutomationWorkspace in $Global:AutomationWorkspace.Keys)
{

    $PowerShellModulePath = "$($Global:AutomationWorkspace.$_AutomationWorkspace.Workspace)\$($Global:AutomationWorkspace.$_AutomationWorkspace.ModulePath)"
    $LocalPowerShellModulePath = "$($Global:AutomationWorkspace.$_AutomationWorkspace.Workspace)\$($Global:AutomationWorkspace.$_AutomationWorkspace.LocalPowerShellModulePath)"

    if(Test-Path -Path $PowerShellModulePath) { $env:PSModulePath = "$PowerShellModulePath;$env:PSModulePath" }
    if(Test-Path -Path $LocalPowerShellModulePath) { $env:PSModulePath = "$LocalPowerShellModulePath;$env:PSModulePath" }
}

$env:LocalAuthoring = $true
$Global:AutomationDefaultWorkspace = 'SCOrchDev'

# Set up debugging
$VerbosePreference = 'Continue'
$DebugPreference = 'Continue'
```

Now that we understand what we are about to add to our profile, and why, we can ensure that the hash table is correctly defined for our workstation folders, and implement these changes.

If you are using the recommended PowerShell ISE, then all you should need to do is type in the interactive window `psedit $profile` which will open a new pane with your current profile, or a new blank profile if one is not already defined. Here we will add the snippets we just reviewed and edited as appropriate. Once you are finished, save the changes to the profile.

Remember that you will need to shutdown and restart the ISE to have it load up the profile on the next startup cycle.

Before we move on with the work, we will run a quick check to ensure that all the modules are available to us now based on the new profile settings. Back in the interactive window we can query for the list of modules which are now offered to us, which should include a number of modules starting with the name **ScorchDev**. If these are not offered, then most likely you will have a mistake in your hash table paths; which you will need to resolve before we proceed.

```powershell
get-module -name SCOrchDev* -listavailable
```
The results we are expecting would be similar to the following output

```powershell-output

    Directory: C:\GIT\SCOrchDev\LocalPowerShellModules


ModuleType Version    Name                                ExportedCommands
---------- -------    ----                                ----------------
Script     1.0.1      SCOrchDev-Scaffold                  New-Scaffold


    Directory: C:\GIT\SCOrchDev\PowerShellModules


ModuleType Version    Name                                ExportedCommands
---------- -------    ----                                ----------------
Script     3.0.4      SCOrchDev-AzureAutomationIntegra... {Publish-AzureAutomationRunbookChange, Publish-AzureAutomationPowerShellModule, Publish-AzureAut...
Script     2.2.1      SCOrchDev-Exception                 {Write-Exception, New-Exception, Convert-ExceptionToString, Get-ExceptionInfo...}
Script     2.1.0      SCOrchDev-File                      {New-ZipFile, New-TempDirectory, Get-FileEncoding, ConvertTo-UTF8...}
Script     2.2.5      SCOrchDev-GitIntegration            {New-ChangesetTagLine, Get-GlobalFromFile, Update-RepositoryInformationCommitVersion, Get-GitRep...
Script     2.1.1      SCOrchDev-PasswordVault             {Get-PasswordVaultCredential, Set-PasswordVaultCredential, Remove-PasswordVaultCredential}
Script     0.1.1      SCOrchDev-StoredCredential          Get-StoredCredential
Script     2.1.9      SCOrchDev-Utility                   {Format-ObjectDump, ConvertTo-Boolean, Select-FirstValid, Find-DeclaredCommand...}

```

# Preparing for Continuous Deployment

With our development system now ready, we can now focus on updating the variables which the **SCOrchDev Continuous Deployment** solution will leverge to deliver its service. There are a number of predefined variables we need to declare, including:

* Azure subscription details and access
* Automation resource group details
* Git Repository information to link for the CI.

## Defining the continuous deployment configuration Variables

The variables we are going to focus on, are all hosted in a folder of our new solution, called `Globals`, within which we will locate a **JSON** formated file, called `zzGlobal.json`.

To begin, we will open and edit this file with our favourite code editor, for example I will launch Visual Studio Code as follows

```powershell
cd ScorchDev\Globals
code .\zzGlobal.json
```

With the file open, we can begin the process of customisation.

1. Our initial variable, `zzGlobal-RunbookWorkerAccessCredentialName` is used to identify the credential object which will have local administrative privilages to the on premise resources. In the scenarion where we are dealing with domain resources this will be defined in Universal Principal Name Format (UPN), and for Local accounts we will just use the short account name.

```json
"zzGlobal-RunbookWorkerAccessCredentialName":  {
    "isEncrypted":  false,
    "Description":  "The credential name for accessing runbook workers",
    "Value":  "automation@damianflynn.com"
},
```

2. The next variable, `zzGlobal-SubscriptionAccessCredentialName` identifies the credential object which has privilages to your Azure Subscription; which will be leveraged to provision your Azure Automation services.

```json
"zzGlobal-SubscriptionAccessCredentialName":  {
    "isEncrypted":  false,
    "Description":  "Name of the credential to be used for authenticating to the subscription",
    "Value":  "azureadmin@damianflynn.com"
},
```

3. Azure Automation is part of the Microsoft Operations Management Suite (OMS), and requires your Log Analythics workspace ID to enable the solution with access to the Hybrid Workers.

```json
"zzGlobal-WorkspaceID":  {
    "isEncrypted":  false,
    "Description":  "the workspace ID of the Log Analytics account with the automation solution deployed to it",
    "Value":  "01234567-abcd-efab-0123-0123456789ab"
},
```

4. As you may have multiple azure Subscriptions, the variable `zzGlobal-SubscriptionName` enables us to identify which subscription we will deploy the Azure Automation account to.

```json
"zzGlobal-SubscriptionName":  {
    "isEncrypted":  false,
    "Description":  "",
    "Value":  "My MVP Subscription"
},
```

5. Leveraging the variable `zzGlobal-AutomationAccountName` we can provide a name for our new Azure Automation account

```json
"zzGlobal-AutomationAccountName":  {
    "isEncrypted":  false,
    "Description":  "name of the automation account",
    "Value":  "SCOrchDev"
},
```

6. Similarly, the variable `zzGlobal-StorageAccountName` premits us to define the name of the storage account we will associate with the Automation Account

```json
"zzGlobal-StorageAccountName":  {
    "isEncrypted":  false,
    "Description":  "Name of a storage account for storing PSModules during import",
    "Value":  "damianscorchdev"
},
```

7. Workers, connected to the automation account, hosted on premise will be allocated to the hybrid group identifed bu the variable `zzGlobal-HybridWorkerGroup`

```json
"zzGlobal-HybridWorkerGroup":  {
    "isEncrypted":  false,
    "Description":  "name of the hybrid worker group for starting sync job on",
    "Value":  "Hybrid"
},
```

8. All the resources we have defined for our subscription so far, will be associatated with the resource group identified by the variable `zzGlobal-ResourceGroupName`

```json
"zzGlobal-ResourceGroupName":  {
    "isEncrypted":  false,
    "Description":  "resource group that the target automation account is stored in",
    "Value":  "SCOrchDev"
},
```

9. For continous deployment to function, we will use the variable `zzGlobal-GitRepository` to identify the GIT reporitories, which will be syncronised to the automation account. Multiple Git repositories can be defined as key value pairs for this variable.

```json
"zzGlobal-GitRepository":  {
    "isEncrypted":  false,
    "Description":  "a key value pair of repositories and their respective branches to sync into this automation account",
    "Value":  "{\"https://github.com/damianflynn/SCOrchDev_MMS2016\":\"master\"}"
},
```

10. The variable `zzGlobal-GitRepositoryCurrentCommit` is used to track the latest commit which has been syncronised to the automation account. This varaible will initially have a -1 value, which will instruct the runbooks to get the lastest version, after which the runbooks will update and manage this variable automatically.

```json
"zzGlobal-GitRepositoryCurrentCommit":  {
    "isEncrypted":  false,
    "Description":  "a key value pair of repositories and their current commit. -1 for initial",
    "Value":  "{\"SCOrchDev_MMS2016\":\"-1\"}"
},
```

11. Finally, we will define the `zzGlobal-LocalGitRepositoryRoot` variable to identify the local path as to where the 

```json
"zzGlobal-LocalGitRepositoryRoot":  {
    "isEncrypted":  false,
    "Description":  "the local path to map the git repositories to",
    "Value":  "c:\\git"
},
```

Once all the varibales have been defined to match our subscription details, we will save the file edits and commit them to our copy of the repository, with a comment

```powershell
cd \git\ScorchDev
git add -A :/
git commit -m "Updated the Configuration Variables to match the subscriptions"
```


## Credentials

Our next step is to create some credential objects to host the account details which will be used within the solution. There are a total of three which we will define. 

We will store these in two locations, Initially in the local Windows Password Valut, and also as atrifacts in the Azure Automation account.

* RunbookWorkerAccessCredentialName
* SubscriptionAccessCredentialName
* OMS Subscription and Primary Key

### Windows Password Vault

To define and store the credentials in the local password vault, we simply create a credental object, and place the details in the object; then we store that object in the local password vault with a helper function called `Set-PasswordVaultCredential` as follows

```powershell
$cred = get-credential
Set-PasswordVaultCredential $cred
```

The first two we will set, are pretty standard, providing the shortname, or UPN for both the **RunbookWorkerAccessCredentialName** and **SubscriptionAccessCredentialName**.

The third and finaly one we will save is the Log Analythics Subscription ID and its private key. In this case the username will be *Subscription ID*, and the password should be the *Private Key* as we provide the credentials.

Once all of the credentials have being defined, and stored, we can check the vault to ensure that everything is working as expected by using the helper command `Get-PasswordVaultCredential`

# Deploying the Solution

At this point we have now completed all the required configuration work in the solution, and can proceed with deploying the framework. 

This will acomplish quite a lot for us, including 

* Building out the Azure Automation account
* Creating a Azure Storage blob to host the PS Modules we may use
* And deploying a runbook which will monitor our Git Repository

## Establish the Azure Automation Account

To start the process, we will call our deployment script as follows:

>Note: It is **imperitave** that you Change into the directory, and not launch indirectly due to path mappings

```powershell
cd \Git\ScorchDev\ARM\\automation-sourcecontrol
./psDeploy.ps1
```

This script will commence by running a preflight check first, once passed it will process the variables we have defined to determine the Azure subscription and Account details which will be leveraged to host the solution.

The next step will see the script populate these varibales as paramaters into an Azure Resource Manager teamplate, and begin the deployment which will take an adverage of 15 minutes to complete.

Once this process has finished, we should be able to see within your Azure subscription a new Azure Automation account created with the name you defined in the variables. Looking into this account you will see that there has been a single runbook added, 39 different assets, and a single DSC Configuration.

![Azure Automation Account Overview](/Media/2016/08/Azure-Automation-Balde.png) 

## Hybrid Workers

The objective of our CI is to ensure that all our runbook workers are running the same workflows, scripts, modules, and varibales. Due to the architecture of the solution we need at least one worker which is of type 'Hybrid' which will assist in reaching out to the Git Repoistory, and pull in any changes locally; then syncronise any identifed changes to the Azutomation account we are using.

This hybrid worker can be hosted, either on Premise or in the Cloud; and does not have any requirements to be joined to a domain.

For the purpose of the document, I am going to cover the steps of deploying the Hybrid worker to Azure, and once deployed, allocate the configuration to the worker using the DSC Extension we have in Azure. You are welcome to use an onpremise worker, and the guidance for assigning the DSC configuration for this worker, can be easily located on the blade for addind nodes to the DSC configuration.

### Deploy a Hybrid Worker

Navigate the Blades, and select the options **New** -> **Virtual Machines** --> **Windows Server Datacenter 2012 R2**, next we will deine that we are going to use the resource manager. The next blades we will then fill in the basic configuration for our worker.


| Setting | Section | Value
---|---|---
| Basics | Name | Worker01
| Basics | VM Disk | HDD
| Basics | User Name | sysadmin
| Basics | Password | <P@ssw0rd!/>
| Basics | Subscription | Damians MVP Subscription
| Basics | Resource Group | Automation
| Size   | VM Size | A0
| Settings | Storage - Stoage account | automation
| Settings | Network - Virtual Network | Automation-vnet
| Settings | Network - Subnet | default (172.17.0.0/24)
| Settings | Network - Public IP | Worker01-ip
| Settings | Network - Network Security Group | Worker01-nsg
| Settings | Network - Virtual Network | Automation-vnet
| Settings | Extensions - Extension | None
| Settings | High Availabily - Set | None
| Settings | Monitoring - Diagnostics | Enabled
| Settings | Monitoring - Diagnostics Storage Account | automation

Then click on **Ok** to begin provisioning the worker, this should take about 5 minutes to complete.

### Provision the Workers Configuration

Once the worker virtual machine has been provisioned, we can proceed with the configuration work. This is going to be very trivial, as the configuration we require for this node has already being stored in the Automation Account and compiled for us.

We will simply associate the Configuration with the node, which will require that we need also add an Extension to the VM which will premit it to process the configuration file we are assigning it.

Navigate to the Automation Account blade, and select the button called **DSC Nodes** which initially have have a *0* count, as there is no associated workers; we will see a new blade open, which offers a button called **Add Azure VM** which will open yet another blade. 

Select the opions

| Setting | Section 
---|---|---
| Select Virtual Machine to Onboard | Worker01
|Registration - Key | Primary
|Registration - Node Configuration Name | **AzureAutomation.HybridRunbookWorker**
|Registration - Refresh Frequency | 30
|Registration - Configuration Mode Frequency | 15
|Registration - Configuration Mode | **ApplyAndAutoCorrect**
|Registration - Allow Module Override | True
|Registration - Reboot Node if Needed | True
|Registration - Action after Reboot | ContinueConfiguration

Patients are needed now, you can navigate to the VM tab, and monitor to see the extenions appear. Once they have been installed which will take about 10 minutes, we should see the DSC Nodes button increment

After the Node is connected to the Configuration, we will wait up to 30 minutes for the configuration to be applied.

If you are like me, you might want to kick the process instead of waiting an additional time. To do this, simply make a connection to the worker, for example we an Remote Desktop to the node, and then initiate the configuration process

```PowerShell
Update-DSCConfiguration -Wait -Verbose
```

Once the node has been marked as **Compliant** in the DSC Nodes blade, we should be also able to see that the button for **HybridWorkerGroup** is no longer showing 0. 

If these are the case, then we are clear to proceed.

## Connect Git Repository to the CI

### Create the Webhook for our runbook

On the Automation Blade, we should see a button for Runbooks, and initially on our deployment we will be presented with just a single runbook. This was deployed as part of the initial deployment process we completed a little earlier, and should be titled **Invoke-GitRepositorySync**

Click on the runbook, and you should then be presented with a blade specifically for the runbook. In the *Details* section you will be presented with a button for *Webhooks*, of which there should be initally *0*.

We are going to add a webhook, which will be used as the trigger for this runbook anytime a new commit is made to the Git Repository. 
* Click on the **Webhooks** button which will expose the *Webhooks* blade.
* Click the option **Add Webhook**
  * On the *Add Webhook* blade, select the option **Create new Webhook** 
    * Provide a *Name* for the webhook, eg **SCOrchDev CI**
    * Set the *Enabled* flag to **Yes**
    * Set a suitable expiry date for the hook
    * Make a copy of the **URL** offered, this is your Webhook, and we will use this as the trigger from GitHub next. The URL will be similar to the following *https://s1events.azure-automation.net/webhooks?token=0aXp94zQExDd0cpfokpquTTR9ptaoVpnQeZrxNv3RRR%3d*
    * Click on the **Create** button
  * Select the option **Modify run settings (Default: Azure)**
    * Ensure the Worker Groups is set to you *Hybrid Group*
  * Click **Create**


### Trigger the Webhook from Git

The final step in this journey is the 

# Whats Next

Adopting the process to work inside **The Release Pipeline**. 
Reference the published white paper on this topic, and the presentations from SCU2016 by Kurt, on Channel 9 to watch an end to end example of our next objectives. 

