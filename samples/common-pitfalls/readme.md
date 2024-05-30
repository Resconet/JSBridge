# Common Pitfalls
This set of samples demonstrates common pitfalls of JSBridge (Resco Next 2024 presentation).

## Usage
Samples were made in VSCode but it can be used in any development tool supporting NPM.

- Before using it move to samples/common-pitfalls in Terminal:

	`cd samples/common-pitfalls`

- Update dependencies:

	`npm i`
- Build Offline HTML distribution:

	`npm run build-win` (on Windows)

	`npm run build-mac` (on MacOS)

Sample support deployment directly to local copy of OfflineHTML folder (instead of uploading to Woodford and syncing project):

- Deploying to currently booted iOS Simulator (on MacOS)

	`npm run deploy-ios-sim`

- Deploying into Windows Store (UWP) app (JSDev app is preferred, Store app folder is used in no JSDev is present):

	`npm run deploy-win-store`

- Deploying into Windows Desktop (MSI):

	`npm run deploy-win-store`

## async onChange

asyncOnChange.html iFrame can be added to Account form as hidden iFrame.
It demonstrates how to react on field change (Postal Code) and run asynchronous routine to calculate another field value (City).


## suspendSave / resumeSave pattern

suspendResumeSave.html iFrame can be added to Account form as hidden iFrame.
It demonstrates how to suspend save validation and run asynchronous routine which tries to supply missing field value.

## script caching
globaliframe.html can be added as "Global hidden iFrame" and versionInfo.html as visible Home iFrame.

It serves to check whether the right version of common script is loaded after deploying new version of Offline HTML via Woodford.