# Project Title

Handle onchange event of 'parentcustomerid' field on contact entity form.

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
	- Set name of IFrame to e.g. 'onChange1'
	- Tap on 'Browse' button, navigate to 'EntityForm_onChange2' folder & select 'index.html' file
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
	- Select parent customer from lookup dialog
	- The code will load parent customer entity and will update 'telephone1' field with the value of current entity telephone.
	- Message dialog will appear with text: 'Parent customer successfully updated.'
	```

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references [Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) we used in this sample.

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**