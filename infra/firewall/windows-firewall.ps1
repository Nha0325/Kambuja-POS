#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [int]$SshPort = 22,
    [int]$HttpPort = 80,
    [int]$HttpsPort = 443,
    [int]$ApiPort = 8080,
    [int]$ManagementPort = 8081,
    [string]$AllowedSshRemoteAddress = "Any",
    [string]$AllowedApiRemoteAddress = "LocalSubnet",
    [string]$AllowedMonitoringRemoteAddress = "LocalSubnet"
)

function Set-KambujaFirewallRule {
    param(
        [string]$Name,
        [string]$DisplayName,
        [int]$Port,
        [string]$RemoteAddress
    )

    Remove-NetFirewallRule -Name $Name -ErrorAction SilentlyContinue
    New-NetFirewallRule `
        -Name $Name `
        -DisplayName $DisplayName `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $Port `
        -RemoteAddress $RemoteAddress `
        -Profile Domain,Private,Public | Out-Null
}

Set-NetFirewallProfile -Profile Domain,Private,Public `
    -DefaultInboundAction Block `
    -DefaultOutboundAction Allow

Set-KambujaFirewallRule -Name "KambujaPOS-SSH" -DisplayName "Kambuja POS SSH" -Port $SshPort -RemoteAddress $AllowedSshRemoteAddress
Set-KambujaFirewallRule -Name "KambujaPOS-HTTP" -DisplayName "Kambuja POS HTTP" -Port $HttpPort -RemoteAddress "Any"
Set-KambujaFirewallRule -Name "KambujaPOS-HTTPS" -DisplayName "Kambuja POS HTTPS" -Port $HttpsPort -RemoteAddress "Any"
Set-KambujaFirewallRule -Name "KambujaPOS-API" -DisplayName "Kambuja POS API" -Port $ApiPort -RemoteAddress $AllowedApiRemoteAddress
Set-KambujaFirewallRule -Name "KambujaPOS-Monitoring" -DisplayName "Kambuja POS Monitoring" -Port $ManagementPort -RemoteAddress $AllowedMonitoringRemoteAddress

Get-NetFirewallRule -Name "KambujaPOS-*" | Get-NetFirewallPortFilter
