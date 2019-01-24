# Project Title

Create custom command and use script to handle its functionality.

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
	- Tap on 'Edit' command in top bar
	- Tap 'New Command'
	- Create name for command what will be handled in script, it means the name = 'createTask', then full command name will be 'custom_createTask'
	- Label name will be displayed on the form command button
	- Add iFrame to entity by tap on command 'Add IFrame'
	- Configure IFrame window will appear
	- Set name of IFrame to e.g. 'onCommand script'
	- Tap on 'Browse' button, navigate to 'EntityForm_onCommand' folder & select 'index.html' file
	```
```
NOTE! - don't UNCHECK 'Delay Load' box, because this event must be registered during EntityForm onload event.
```

For more details about setup the project, please follow [Guide](https://github.com/Resconet/JSBridge/blob/master/README.md) **Guide section**

## Runninig test

Run Resco MobileCRM application and sync with valid organization url, that refers to project where you installed this sample.

	```
	- Synchronize
	- Navigate to 'Accounts' entities list
	- Select existing record
	- 'Info' tab will be displayed
	- Tap on 'Command' button in up right corner
	- The code will be executed and it will create new task with predefined properties, property 'scheduledstart' will be set using new Date method.
	- Message dialog will appear with text: 'Task [name of account] created successfully..'
	```

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references [Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) we used in this sample.

## Contributing

## Authors

* **Maros Kolibas** - **Resco.net**