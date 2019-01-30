# Offline HTML development & debugging dools
A set of tools that makes the Offline HTML development much easier.

## iOS Tools
**iReSign.app**
* MacOS application performing resigning of the Mobile CRM app (JSDev or Enterprise edition)
* It requires the iOS development (or distribution) certificate installed in KeyChain Access (can be done with Xcode)
* It requires the development (or in-house) provisioning profile (which can be downloaded from Apple Developer portal)

**getOfflineHtmlDir.sh**
* bash script for MacOS returning the path to the Offline HTML root of the Mobile CRM app in currently booted iOS Simulator
* Usage: *sh getOfflineHtmlDir.sh*

## Windows Tools
**MobileCrmIntegration.vsix**
* Visual Studio 2015/2017 extension installer
* Adds the command "Run in Mobile CRM" to your Visual Studio menu "Tools"
* It can be used to run the Typescript app project in Mobile CRM app (JSDev edition is recommended)
* It initiates the build step (saves the files and compiles the Typescript files), then it runs the Mobile CRM app with the overridden HTML root pointed to the solution folder and finally it attaches the script debugger to Mobile CRM process. 
