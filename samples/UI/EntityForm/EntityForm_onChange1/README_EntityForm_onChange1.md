# Project Title

Handle onchange event of 'address1_city' field on entity form.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See installation for notes on how to deploy the project on a live system.

### Prerequisites

	- Resco MobileCRM application
	- Files included in project (JSBridge.js,...)
	- Folder structure must be strictly respected (root folder contains .html page and required .js) files
	- Woodford project

### Installation

To run this sample code you have to set-up Woodford environment properly.

	- Create new project in Woodford or use existing
	- Download the files in this folder to your local machine.
	- Import files from this folder to OfflineHTML section in Woodford project
	- Go to 'Contact' entity form
	- Tap on command 'Add IFrame'
	- Configure IFrame window will appear
	- Set name of IFrame to e.g. 'onChange1'
	- Tap on 'Browse' button, navigate to 'EntityForm_onChange1' folder & select 'index.html' file
NOTE! - don't UNCHECK 'Delay Load' box, because this event must be registered during EntityForm onload event.

## Runninig test

Run Resco MobileCRM application and sync with valid organization url, that refers to project where you installed this sample.

	- Synchronize
	- Navigate to 'Contacts' entities list
	- Select any record or tap on '+' (Create new)
	- Change 'First Name' or 'Last Name'
	- Message dialog will appear with text: 'Contact FullName: [Changed value]'

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references

	* **Webinars:** https://www.youtube.com/watch?v=cplZLC_mAc0&list=PLPMCnAPD5b56XNEiGTcy5VBxdP8rcB86b&index=12%20%20 (watch second part as well)
	* **Woodford:** http://www.resco.net/MobileCRM/support/Woodford_Guide.html#__RefHeading__6015_1627906509
	* **Reference:** http://www.resco.net/mobilecrm/support/jsbridge.aspx
	* **Guide:** https://www.resco.net/support/jsbridge-guide
	* **OfflineHTML solution:** https://www.resco.net/debugging-offline-html-solution/

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**