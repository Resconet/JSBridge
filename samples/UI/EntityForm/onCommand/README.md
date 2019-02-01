## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onCommand method Reference document: [UI.EntityForm.onCommand](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onCommand)

## onCommand usage

MobileCRM.UI.EntityForm.onCommand(command, handler, bind, scope)

> command - string - EntityForm command name
<br /> handler - function(entityForm) - actions to be performed on command click event 
<br />bind - Boolean - determines whether to register or unregister handler on change event 
<br />scope - Object - scope for handler calls

Recommended usage cases:
- perform specific actions once user clicks on specified EntityForm command

## Example explanation

Provided example demonstrates how to automatically create new task record from account form by using a form button. Once user hits "Create Task" (custom_createTask) button, new task record is created and its fields are filled with predefined values from code - without need to open task form.

**1.	MobileCRM.UI.EntityForm.onCommand(...)**
<br /> onCommand method registers action handler for 'custom_createTask' command. Once user clicks on this button from account entity form, handler will be registered and following actions will be done:
Firstly, it checkes, whether the record which is currently open (account record) is new or not. If this record is already existing and it is saved, then new task record is created using 'MobileCRM.DynamicEntity.createNew("task");'. Following steps are setting values to task attributes. In the last step, task record is being saved. User is informed about result of creating new task record via alert. 

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onCommand/Debug/README.md)

**onCommand.html file:**
Open this file to check sample code directly.

## How to run the sample in the application?

[Click for instructions](https://github.com/Resconet/JSBridge/tree/master/samples)

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references we used in this sample: [References Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) 

## Authors

* **Maros Kolibas** - **Resco.net**
* **Lucia Pavlikova** - **Resco.net**
