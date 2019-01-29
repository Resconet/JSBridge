## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onChange method Reference document: [UI.EntityForm.onChange](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onChange)
<br />onItemChange method Reference document: [UI.EntityForm.onItemChange](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onItemChange)

## onChange usage

MobileCRM.UI.EntityForm.onChange(handlerFunction(){}, bind, scope)
<br />MobileCRM.UI.EntityForm.onItemChange("itemName", handlerFunction(){}, bind, scope)

> handlerFunction() - actions to be performed on change event
<br /> bind - Boolean - determines whether to register or unregister handler on change event
<br />scope - Object - scope for handler calls

Recommended usage cases:
- automatically perform specific action once change event occurs on form

## Example explanation

Provided example demonstrates how to automatically change phone number of contact once value of 'Regarding' field on contact form is changed. Phone number is taken from parent entity record (account).

**1.	Function setParentPhoneOnChange:**
	<br />This function registers handler for change event on form. It stores changed items of form in context variable. If changed item equals 'parentcustomerid', it loads parent record data. Phone number from parent record and current contact phone number are compared. If they missmatch, phone number is updated and user is informed about this action via alert. This function is triggered every time change event occurs, since its bind value is set to true.

**2.	Function clearAddressOnItemChange:**
	<br />This function registers handler for change event on specific form item. If changed item equals 'address_city1' it automatically clears current values of state, country and postal code fields.This function is triggered every time change event occurs on 'address_city1' field, since its bind value is set to true.
	
> By window.onload = function(){} both onChange handlers are recognized on load event.

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md]()

**onChange.html file:**
Open this file to check sample code directly.

## How to run the sample in the application?


## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references we used in this sample: [References Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) 

## Authors

* **Maros Kolibas** - **Resco.net**
* **Lucia Pavlikova** - **Resco.net**
