## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onCanExecuteCommand method Reference document: [UI.EntityForm.onCanExecuteCommand](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onCanExecuteCommand)
<br />onChange method Reference document: [UI.EntityForm.onChange](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onChange)
<br />onChange method usage sample: [EntityForm/onChange](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/onChange)

## onCanExecuteCommand usage

MobileCRM.UI.EntityForm.onCanExecuteCommand(command, handlerFunction(){}, bind, scope)

> command - String - entity form command name
<br />handler - function(entityForm) - handler indicates whether command is enabled or not
<br /> bind - Boolean - determines whether to register or unregister handler on change event
<br />scope - Object - scope for handler calls

Recommended usage cases:
- define cases in which form command should be enabled for user in the application

## Example explanation

Provided example demonstrates how to automatically enable 'Won' command on opportunity form if opportunity rating is 'Hot' and estimated value is greater than 100.

**1.	Function canWonOpportunity:**
	<br />Handler function enables 'Won' command if *opportunityratingcode* equals 1 and *estimatedvalue* is greater than 100.

**2.	Function onChange:**
	<br />This function registers handler for change event on *opportunityratingcode* and *estimatedvalue* form items. If changed item equals one of these field names, canWonOpportunity function is called.
	
> By window.onload = function(){} onChange handler is recognized on load event.

## In this repository
    
**Debug repository:**
Find more information here: [onCanExecuteCommand Debug](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/onCanExecuteCommand/Debug)

**onCanExecuteCommand.html file:**
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
