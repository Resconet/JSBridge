## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />selectTabEx method Reference document: [UI.EntityForm.selectTabEx](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_selectTabEx)
<br />selectView method Reference document: [UI.EntityForm.selectView](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_selectView)
<br />isViewMaximized method Reference document: [UI.EntityForm.isViewMaximized](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_isViewMaximized)

## selectTabEx, selectView and isViewMaximized usage

Recommended usage cases:
- on specific user action focus & maximize entity form tab and view 

## Example explanation

Provided example demonstrates how to automatically set focus and maximize form tab and view. The sample code works with Order (salesorder) entity. 

**1.	Function selectProductTab:**
	<br />This function selects the *Order Products* tab on Order entity form. On button click, tab is selected by its name.

**2. Function selectViewAndMaximizeProductTab:**
  <br />On button click, it selects the *Order Products* tab and its default view on Order entity form. If this tab isnt maximized, it also maximizes it.

**3. Function selectTabAndMaximizeForm:**
  <br />On button click, it selects IFrame tab and maximizes whole entity form.

**Before testing the example, please make sure you have correct tab and view names set in the code.**

## In this repository
    
**Debug repository:**
Find more information here: [SelectTabAndView Debug](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/SelectTabAndView/Debug)

**SelectTabAndView.html file:**
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
