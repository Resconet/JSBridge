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

onCommand method registers action handler for 'custom_createTask' command. Once user clicks on this button from account entity form, handler will be called and following actions will be done:

1. it checks, whether the form's record already exists
2. if it exists, new task dynamic entity is created
3. task atttributes are set
4. dynamic entity is saved
5. user is notified via alert that new record was created

## In this repository
    
**Debug repository:**
Includes step by step instructions on how test and debug the sample.
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onCommand/Debug/README.md)

**onCommand.html file:**
Open this file to check sample code directly.

## How to run the sample in the application?

[Click for instructions](https://github.com/Resconet/JSBridge/tree/master/samples)

>Custom command must be added to entity form to run this example.

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references we used in this sample: [References Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) 

## Authors

* **Maros Kolibas** - **Resco.net**
* **Lucia Pavlikova** - **Resco.net**
