# Project Title

Create handler for save event on entity form, what will suspend save and call asynchronous fetch method to run simple count of parent records validation.

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
	- Go to 'Account' entity form
	- Add iFrame to entity by tap on command 'Add IFrame'
	- Configure IFrame window will appear
	- Set name of IFrame to e.g. 'onSave script'
	- Tap on 'Browse' button, navigate to 'EntityForm_saveHandler' folder & select 'index.html' file
	```
```
NOTE! - don't UNCHECK 'Delay Load' box, because this event must be registered during EntityForm onload event.
```

## Runninig test

Run Resco MobileCRM application and sync with valid organization url, that refers to project where you installed this sample.

	```
	- Synchronize
	- Navigate to 'Accounts' entities list
	- Create new record or select existing one
	- 'Info' tab will be displayed
	- Edit any field to make form **Dirty**, it will allow sveHandler to fire
	- The code will call suspend save method ('entityForm.suspendSave'), and will fetch count of associated contacts.
	- In case of count of fetched records is greater than one, **saveHandler** will resume save without error.
	- If any error occurs, message dialog will display it and **saveHandler** will not be resumed.
	```												 
## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references [Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) we used in this sample.

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**