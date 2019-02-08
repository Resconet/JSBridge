## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />onSelectedViewChanged method Reference document: [UI.EntityForm.onSelectedViewChanged](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_onSelectedViewChanged)
<br />getDetailView method Reference document: [UI.EntityForm.getDetailView](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_getDetailView)
<br />startEditItem method Reference document: [variable.startEditItem](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI__DetailView_startEditItem)

## onSelectedViewChanged usage

MobileCRM.UI.EntityForm.onSelectedViewChanged(handlerFunction(){}, bind, scope)

> handlerFunction() - actions to be performed when user manually switches views of form (tabs on form)
<br /> bind - Boolean - determines whether to register or unregister handler on selected view change event
<br />scope - Object - scope for handler calls

Recommended usage cases:
- automatically perform specific action once user switches actual form tab he is using in the application

>  Selected View in this method represents current used "Tab" on entity Form. Common default tabs are 'General', 'Address', 'Notes'...

## Example explanation

Provided example demonstrates how to automatically set focus on *City* field on form when user manually switches to *Address* tab on Form. *City* field has to be empty to gain focus on this event.

**1.	Function updateAddressFieldsWhenAddressTabIsVisible:**
	<br />This function registers handler for selected view change event. If user switches (for example) from *General* to *Address* tab, we store Address detail item object in *dv* variable. As we want to set focus on *City* field, we have to use getItemByName method to get 'address1_city' detail item object and store it in cityItem variable. If this object exists, is enabled in project, visible on form and has no value, focus is set on it by .startEditItem method. 

> By window.onload = function(){} onSelectedViewChanged handler is recognized on load event.

**If 'NewForm UI' is enabled in the application setup, this sample isn't applicable. Tab has to be switched manually, which is not possible if tabs are displayed within one grid.**

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onSelectedViewChanged/Debug/README.md)

**onSelectedViewChanged.html file:**
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
