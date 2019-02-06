## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onSave Reference document: [UI.EntityForm.onChange](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onSave)
<br />suspendSave method Reference document: [UI.EntityForm.suspendSave] (https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_suspendSave)
<br />Fetch sample: [samples/FetchXML/execute](https://github.com/Resconet/JSBridge/tree/master/samples/FetchXml/Execute)

## onSave usage

MobileCRM.UI.EntityForm.onSave(handlerFunction(){}, bind, scope)

> handlerFunction() - actions to be performed on save event
<br /> bind - Boolean - determines whether to register or unregister handler on change event
<br />scope - Object - scope for handler calls

Recommended usage cases:
- automatically perform specific action once save event occurs on form

## Example explanation

Provided example demonstrates how to check whether account record has related contact records once entity form is being saved. In the sample we check whether there is at least one related contact. If there is none related contact, save operation stops with an error.

**1.	MobileCRM.UI.EntityForm.onSave():**
	<br />This function registers handler for save event on form. Current entity data are stored within editedAccount variable. suspedSave method must be called within function to "tell" the application to wait for the result of another asynchronous operation before save. In this sample, it is Fetch which is executed asynchronously. Aggregated fetch is specified - count all contacts, which have current account ID set as parent record. If result of the fetch is higher than 0, form is saved. resumeSave method is called with null parameter in case of success (fetch result is > 0). Otherwise, resumeSave is called with an error string and save operation is killed.

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onSave/Debug/README.md)

**onSave.html file:**
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
