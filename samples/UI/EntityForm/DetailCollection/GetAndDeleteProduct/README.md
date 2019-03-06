## JSBridge Reference

Detail Collection object Reference document: [UI.EntityForm.DetailCollection](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection)
<br />getAll method Reference document: [UI.EntityForm.DetailCollection.getAll](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection_getAll)
<br />deleteById method Reference document: [UI.EntityForm.DetailCollection.deleteById](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection_deleteById)
<br />deleteByIndex method Reference document: [UI.EntityForm.DetailCollection.deleteByIndex](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection_deleteByIndex)

## DetailCollection get and delete methods usage

Detail collections provide methods to access and perform actions on the collections of the sales entity details.

Recommended usage cases of methods used in the sample:
- delete collection record(s) from the sales entity based on specific condition (e.g. delete product(s) from the Order products collection)

## Example explanation

Provided example demonstrates how to get all the items in the Order products collection of particular Order. It demostrates how to sort the collection items, delete the most expensive product by its Id or delete last product in the collection based on collection length.

**Function getProductAndDelete:**
1. get all products related with the order and store them in *DetailCollection object*
2. sort the collection items from the least to the most expensive
3. get name of the most expensive product
4. based on the selected button:
  <br />a) delete the most expensive product by its name  
  b) delete the last product in the collection by its index
	
> Please note that deleteById method uses unsorted collection of items, therefore the last item doesnt have to be the most expensive one.

## In this repository
    
**Debug repository:**
Find more information here: [GetAndDeleteProduct Debug](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/DetailCollection/GetAndDeleteProduct/Debug)

**GetAndDeleteProduct.html file:**
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
