# Project Title

Handle onload event of entity form using 'requestObject' method.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See installation for notes on how to deploy the project on a live system.

### Prerequisites

Things you have to follow to use files properly

	```
	- Resco MobileCRM application
	- Files included in project (JSBridge.js,...)
	- Folder structure must be strictly respected (root folder contains .html page and required .js) files
	- Woodford project
	```

### Installing

To run this sample code you have to set-up Woodford environment properly.

	```
	- Create new project in Woodford or use existing
	- Download the files in this folder to your local machine.
	- Import files from this folder to OfflineHTML section in Woodford project
	- Go to 'Contact' entity form
	- Tap on command 'Add IFrame'
	- Configure IFrame window will appear
	- Set name of IFrame to e.g. 'onload'
	- Tap on 'Browse' button, navigate to 'EntityForm_onload' folder & select 'index.html' file
	```
```
NOTE! - don't UNCHECK 'Delay Load' box, because this event must be registered during EntityForm onload event.
```

## Runninig test

Run Resco MobileCRM application and sync with valid organization url, that refers to project where you installed this sample.

	```
	- Synchronize
	- Navigate to 'Contacts' entities list
	- Select any record or tap on '+' (Create new)
	- onload script will be executed and 'requestObject' method will be fired, immediately after EntityForm is requested.
	- The address fields will be set with predefined values
	- Select 'Address' tab to see changes
	```

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references [Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) we used in this sample.

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**