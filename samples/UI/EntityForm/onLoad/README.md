## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />requestObject method Reference document: [UI.EntityForm.requestObject](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_requestObject)

> The method itself is not called onLoad. We are requesting object and performing actions on load event of the form (window.onload).

## requestObject usage on load event

MobileCRM.UI.EntityForm.requestObject(callback, errorCallback, scope)

> callback - function(entityForm) - callback function called asynchronously with serialized EntityForm object as argument
<br /> errorCallback bind - function(errorMsg) - errorCallback which is called in case of error
<br />scope - Object - scope for callbacks

Recommended usage cases:
- automatically perform specific actions once load event occurs on form

**HINT:** *Always make sure you have unchecked 'Delay Load' setting on IFrame, if you want your code to run on load event.*

## Example explanation

Provided example demonstrates how to automatically set address to address fields of contact once form is loaded. Second method demonstrates how to automatically assign email from parent to child record, in case email field on parent is not empty.

**1.	Function onLoadSetAddress:**
<br /> This function is called via window.onload which registers handlers during load event. On load event, entity form is requested and values are added to its attributes. City, state, postal code and country field values are automaticaly entered. This callback function returns true to ensure that changes are applied.

**2.	Function loadParentAccount:**
<br />This function is called on load event as well. It checks parentcustomerid (customer) field and in case it has value, it creates fetch on selected parent entity record. In this example, it is account entity. Afterwards, filter is created to make sure that we only fetch account record, which is set as 'Customer' on currect contact form. In the last step, email address from account is set as email address of current contact and email field is made uneditable. This callback function returns true to ensure that changes are applied.

> Keep in mind that actions of each method are specified within callback functions, so they are run asynchronously.

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onLoad/Debug/README.md)

**onChange.html file:**
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
