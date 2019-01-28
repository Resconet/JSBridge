## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onChange method Reference document: [UI.EntityForm.onChange](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onChange)

## onChange usage


Recommended usage cases


## Example explanation

Provided example demonstrates how to automatically change phone number of contact once value of 'Regarding' field on contact form is changed. Phone number is taken from parent entity record (account).

**1.	Function setParentPhoneOnChange:**
	<br />This functions stores changed items of form in context variable. If changed item equals 'parentcustomerid', it loads parent record data. Phone number from parent record and current contact phone number are compared. If they missmatch, phone number is updated and user is informed about this action via alert.

**2.	Function:**
	<br />

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
