---
author: Damian Flynn
comments: true
date: 2015-09-29 18:25:00
layout: post
title: "Federation: Signiant Media Shuttle"
categories: Tutorials
tags:
- Active Directory
- PowerShell
- Federation
---


# Signiant Federation

## Signiant Portal configuration

>NOTE: The following is an extract from the Signiant documentation

Configure the Identity Provider Metadata URL in Media Shuttle
1. Launch the Media Shuttle Administration Console for your portal and go to the Security
page.
2. Enable the "Use external SAML 2.0 provider to manage member logins" option in the
"Login is required" section.
3. Type the metadata URL of your AD FS server in the "Identity Provider Metadata
URL" field (eg. https://<FQDN_of_your_ActiveDirectoryFederationService>/FederationMetadata/20
07-06/FederationMetadata.xml).
4. Copy the Media Shuttle Service Provider Metadata URL that is provided (eg.
https://sample.mediashuttle.com/saml2/metadata/sp). This is required for the AD FS Relying Party Trust configuration step.
5. Click Save.

## ADFS configuration

### Manual Exercise

Launch the AD FS 2.x Management Console.
1. Go to AD FS 2.x > Trust Relationships > Relying Party Trusts.
2. Select 'Add Relying Party Trust' from the Action menu to launch the Add Relying Party
Trust Wizard. Click Start.
  * Select the option to 'Import data about the relying party published online'.
  * Input the Media Shuttle Service Provider Metadata URL from Stage 1, and click Next.
  * Enter your Media Shuttle portal name as the display name. Click Next.
  * Select the option to 'Permit all users...'. Click Next.
  * Click Next to complete the wizard
  * Enable the checkbox to 'Open the Edit Claim Rules dialog'. Click Close.
3. On the 'Edit Claim Rules' dialog
  * On the Issuance Transform Rules tab, click the 'Add Rule' button and select 'Send
Claims using a Custom Rule'. Click Next.
    * In the Claim Rule Name field, type "<Your Media Shuttle portal name> Custom Claim".
    * In the Custom Rule field, copy and paste the following custom rule.
```
c1:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"] &&
c2:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/authenticationinstant"]
=> add(
store = "_OpaqueIdStore",
types = ("https://sample.mediashuttle.com/internal/sessionid"),
query = "{0};{1};{2};{3};{4}",
param = "useEntropy",
param = c1.Value,
param = c1.OriginalIssuer,
param = "",
param = c2.Value);
```
> Replace https://sample.mediashuttle.com with the URL of your Media Shuttle portal.
    * Click Finish.
  * Click the 'Add Rule' button and select 'Transform an Incoming Claim'. Click Next.
    * In the Claim Rule Name field, type "<Your Media Shuttle portal name> Claim
Transform".
    * In the Incoming Claim Type field, type "https://sample.mediashuttle.com
/internal/sessionid", replacing https://sample.mediashuttle.com with the URL of your
Media Shuttle portal.
> Note: This must exactly match the "types" parameter from the
Custom Rule you entered in Step 11, above.
    * In the Outgoing Claim Type field, select the "Name ID" option.
    * In the Outgoing Name ID Format field, select the "Transient Identifier" option.
    * Select the Pass Through All Claim Values option, then Click Finish.
  * Click the 'Add Rule' button and select 'Send LDAP Attributes as Claims'. Click Next.
    * In the Claim Rule Name field, type "<Your Media Shuttle portal name> LDAP
Attributes".
    * In the Attribute Store field, select the Active Directory option.
    * In the LDAP Mapping fields, specify the following mappings:
```
LDAP Attribute Outgoing Claim Type
E-Mail-Addresses E-Mail Address
User-Principal-Name UPN
SAM-Account-Name Common Name
Display-Name Name
Given-Name Given Name
Surname Surname
Token Groups - Unqualified Names Role
```
    * Click Finish.
  * Click Apply, then Click OK to close the Edit Claim Rules dialog.
4. Select your portal in the Relying Party Trusts list, then select 'Properties' from the
Action menu.
  * Go to the Advanced tab.
  * In the Secure Hash Algorithm field, select the "SHA-1" option. Click Apply. Click OK.


### Powershell

PowerShell function based on ```ActiveDirectory``` and ```ActiveDirectoryFederationServices``` modules

<code data-gist-id="322050495c32d9d6eac2" data-gist-file="Add-SigniantFederationRelyingTrust.ps1"></code>

```powershell

function Add-SigniantFederationRelyingTrust {
   param (
      [string]$Name = "Lionbridge Send Signant";
      [string]$Group = "!CORP IT grp Signiant Send Portal Access";
      [string]$MetadataURL = "https://lionbridge-send.mediashuttle.com/saml2/metadata/sp"
   )

   $PortalEndpoint = $MetadataURL.Split('/')[2]
   Write-Verbose "Hosted Domain is [$PortalEndpoint]"

   $SignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
   $groupInfo = Get-A$GroupSID -name $Group

   $IssueTransformRule = @'
@RuleName = "__Name__ Custom Claim"
c1:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"]
&& c2:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/authenticationinstant"]
=> add(store = "_OpaqueIdStore", types = ("https://__Portal_Endpoint__)/internal/sessionid"), query = "{0};{1};{2};{3};{4}", param = "useEntropy", param = c1.Value, param = c1.OriginalIssuer, param = "", param = c2.Value);

@RuleTemplate = "MapClaims"
@RuleName = "__Name__ Claim Transform"
c:[Type == "https://__Portal_Endpoint__/internal/sessionid"]
=> issue(Type = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", Issuer = c.Issuer, OriginalIssuer = c.OriginalIssuer, Value = c.Value, ValueType = c.ValueType, Properties["http://schemas.xmlsoap.org/ws/2005/05/identity/claimproperties/format"] = "urn:oasis:names:tc:SAML:2.0:nameid-format:transient");

@RuleTemplate = "LdapClaims"
@RuleName = "__Name__ LDAP Attributes"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname", Issuer == "AD AUTHORITY"]
=> issue(store = "Active Directory", types = ("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn", "http://schemas.xmlsoap.org/claims/CommonName", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"), query = ";mail,userPrincipalName,sAMAccountName,displayName,givenName,sn,tokenGroups;{0}", param = c.Value);
'@


   $IssueAuthorizationRule = @'
@RuleName = "__Name__ Restriction to group __Group__"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid", Value =~ "^(?i)__Group_SID__$"]
=> issue(Type = "http://schemas.microsoft.com/authorization/claims/permit", Value = "true");
'@


   # Customise the Issuance Transform Rule
   $IssueTransformRule     = $IssueTransformRule.Replace("__Portal_Endpoint__",$PortalEndpoint)
   $IssueTransformRule     = $IssueTransformRule.Replace("__Name__",$Name)

   # Customise the Issuance Authorization Rule
   $IssueAuthorizationRule = $IssueAuthorizationRule.Replace("__Group_SID__",$GroupInfo.SID.Value)
   $IssueAuthorizationRule = $IssueAuthorizationRule.Replace("__Group__",$GroupInfo.Name)
   $IssueAuthorizationRule = $IssueAuthorizationRule.Replace("__Name__",$Name)

   # Add the New Relaying Trust
   Add-ADFSRelyingPartyTrust -Name $Name –MetadataURL $MetadataURL -IssuanceAuthorizationRules $IssueAuthorizationRule -IssuanceTransformRules $IssueTransformRule
   Set-ADFSRelyingPartyTrust -TargetName $Name -SignatureAlgorithm $SignatureAlgorithm
}

```

Now, we can create federations really simply

```powershell
Add-SigniantFederationRelyingTrust -Name "My Signant Send Portal" -Group "!grp Signiant Send Portal Access" -MetadataURL = "https://myportal-send.mediashuttle.com/saml2/metadata/sp"
```
