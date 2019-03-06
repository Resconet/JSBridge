## JSBridge Reference

Detail Collection object Reference document: [UI.EntityForm.DetailCollection](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection)
<br />add method Reference document: [UI.EntityForm.DetailCollection.add](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection_getAll)
<br />addProductWithQuantity method Reference document: [UI.EntityForm.DetailCollection.addProductWithQuantity](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_DetailCollection_addProductWithQuantity)

## DetailCollection *add* methods usage

Detail collections provide methods to access and perform actions on the collections of the sales entity details.

Recommended usage cases of methods used in the sample:
- add products to sales entity products collection (e.g. add product(s) to existing Order record)

## Example explanation

Provided example demonstrates how to add one or multiple products to Order.

**Function addProduct:**
1. create fetch for product entity object
2. get product attributes and set order for the fetch result
3. execute the fetch
4. add first product from the fetch to Order Products collection
5. if there is no product fetched or add action was unsuccessful, show message to the user
	
**Function addProductWithQuantity:**
1. create fetch for product entity object
2. get product attributes and set order for the fetch result
3. execute the fetch
4. add first product from the fetch to Order Products collection **10 times**
5. if there is no product fetched or add action was unsuccessful, show message to the user

## In this repository
    
**Debug repository:**
Find more information here: [AddProduct Debug](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/DetailCollection/AddProduct/Debug)

**addSalesEntityProduct.html file:**
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
