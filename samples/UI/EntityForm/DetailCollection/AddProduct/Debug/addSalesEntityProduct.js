/// <reference path="JSBridge.d.ts"/>
/** Fetch products and use first one to add it into Order product details.*/
function addProduct() {
    // first fetch any existing product
    var productFetchEntity = new MobileCRM.FetchXml.Entity("product");
    productFetchEntity.addAttributes();
    // order fetch results in descending price way
    productFetchEntity.orderBy("price", true);
    var fetch = new MobileCRM.FetchXml.Fetch(productFetchEntity);
    fetch.execute("DynamicEntities", function (res) {
        if (res.length < 1)
            MobileCRM.bridge.alert("Not any product was found.");
        else {
            var product = res[0];
            // Add product to collection
            // we can use Dynamic entity as parameter, since it extends the MobileCRM.Reference object. 
            MobileCRM.UI.EntityForm.DetailCollection.add(product, function (detail) {
                // set discount to 10.
                detail.properties["manualdiscountamount"] = 10.0;
                detail.update(function (err) {
                    if (err)
                        MobileCRM.bridge.alert("Failed to update the product.\n\nErr: " + err);
                });
            }, function (err) { MobileCRM.bridge.alert("Failed to add product to sales detail collection.\n\nErr: " + err); }, null);
        }
    }, function (err) { MobileCRM.bridge.alert("Failed to fetch products.\n\nErr: " + err); }, null);
}
/**
 * Fetch products and use first one to add it into Order product details with desired quantity.
 * @param quantity quantity for products.
 */
function addProductWithQuantity(quantity) {
    // first fetch any existing product
    var productFetchEntity = new MobileCRM.FetchXml.Entity("product");
    productFetchEntity.addAttributes();
    // order fetch results in descending price way
    productFetchEntity.orderBy("price", true);
    var fetch = new MobileCRM.FetchXml.Fetch(productFetchEntity);
    fetch.execute("DynamicEntities", function (res) {
        if (res.length < 1)
            MobileCRM.bridge.alert("Not any product was found.");
        else {
            var product = res[0];
            // Add product to collection
            // we can use Dynamic entity as parameter, since it extends the MobileCRM.Reference object. 
            MobileCRM.UI.EntityForm.DetailCollection.addProductWithQuantity(product, quantity, function (detail) {
                // order detail will be updated automatically.
            }, function (err) { MobileCRM.bridge.alert("Failed to add product to sales detail collection.\n\nErr: " + err); }, null);
        }
    }, function (err) { MobileCRM.bridge.alert("Failed to fetch products.\n\nErr: " + err); }, null);
}
//# sourceMappingURL=addSalesEntityProduct.js.map