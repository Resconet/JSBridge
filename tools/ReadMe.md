# Offline HTML development & debugging tools
A set of tools that makes the Offline HTML development much easier.

## iOS Tools
**iReSign.app**
* MacOS application performing resigning of the Mobile CRM app (JSDev or Enterprise edition)
* It requires the iOS development (or distribution) certificate installed in KeyChain Access (can be done with Xcode)
* It requires the development (or in-house) provisioning profile (which can be downloaded from Apple Developer portal)

**ios-sim-offline-html-dir.sh**
* bash script for MacOS returning the path to the Offline HTML root of the Mobile CRM app in currently booted iOS Simulator
* Usage:

	`sh ios-sim-offline-html-dir.sh` - displays folder

	`cp -f dist/* $(sh tools/iOS/ios-sim-offline-html-dir.sh)` - copies content of dist folder into simulator's offline HTML root

## Windows Tools
**win-desktop-deploy.bat**
* Deploys files into Mobile CRM desktop app's (MSI) Offline HTML root.
* Usage:

	`tools\Windows\win-desktop-deploy dist\*`

**win-store-deploy.bat**
* Deploys files into Mobile CRM Windows Store (UWP) app's Offline HTML root.
* If both JSDev (Development) edition and production (Store) apps are installed, JSDev app folder is preferred.
* Usage:

	`tools\Windows\win-store-deploy dist\*`

**MobileCrmIntegration.vsix** (OBSOLETE)
* Visual Studio 2015/2017 extension installer
* Adds the command "Run in Mobile CRM" to your Visual Studio menu "Tools"
* It can be used to run the Typescript app project in Mobile CRM app (JSDev edition is recommended)
* It initiates the build step (saves the files and compiles the Typescript files), then it runs the Mobile CRM app with the overridden HTML root pointed to the solution folder and finally it attaches the script debugger to Mobile CRM process. 
