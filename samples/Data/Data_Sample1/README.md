# Project Title

Create account entity record with specified properties, call save method and update 'emailaddress' property.
Use FetchXml or loadById method to retrieve dynamic entity data object.

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
	- Go to 'Home' section
	- Select 'Root' group or create new one with desired name
	- Click on the group you want to add iFrame on
	- Tap command 'Add iFrame'
	- Configure IFrame window will appear
	- Set name of IFrame to e.g. 'Create and Update Account'
	- Tap on 'Browse' button, navigate to 'Data_Sample1' folder & select 'index.html' file
	```
```
Home form is used to quick access to run the sample.
```

## Runninig test

Run Resco MobileCRM application and sync with valid organization url, that refers to project where you installed this sample.

	```
	- Synchronize
	- Home form will be displayd
	- Navigate to iFrame or to group what contains iFrame
	- Click on 'Create Account' button to execute script
	- In case of everything was sucessfull new account entity with name '#New Test account' is created and its email address is updated.
	- If any error occures, message dialog will display it and code will not create new record.
	```												 
## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references [Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) we used in this sample.
DynamicEntity - https://www.resco.net/javascript-bridge-reference/#MobileCRM_DynamicEntity
FetchXml - https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**