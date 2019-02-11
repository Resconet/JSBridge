/// <reference path="JSBridge.d.ts"/>

/** Fetch products and use first one to add it into Order product details.*/
function addProduct() {
    // first fetch any existing product
    let productFetchEntity = new MobileCRM.FetchXml.Entity("product");
    productFetchEntity.addAttributes();
    // order fetch results in descending price way
    productFetchEntity.orderBy("price", true);

    let fetch = new MobileCRM.FetchXml.Fetch(productFetchEntity);
    fetch.execute("DynamicEntities", (res) => {

        if (res.length < 1)
            MobileCRM.bridge.alert("Not any product was found.");
        else {
            let product = res[0] as MobileCRM.DynamicEntity;
            // Add product to collection
            // we can use Dynamic entity as parameter, since it extends the MobileCRM.Reference object. 
            MobileCRM.UI.EntityForm.DetailCollection.add(product, (detail) => {
                // set discount to 10.
                detail.properties["manualdiscountamount"] = 10.0;
                detail.update((err) => {
                    if (err)
                        MobileCRM.bridge.alert("Failed to update the product.\n\nErr: " + err);
                });
            }, (err) => { MobileCRM.bridge.alert("Failed to add product to sales detail collection.\n\nErr: " + err); }, null);
        }
    }, (err) => { MobileCRM.bridge.alert("Failed to fetch products.\n\nErr: " + err); }, null);
}

/**
 * Fetch products and use first one to add it into Order product details with desired quantity.
 * @param quantity quantity for products.
 */
function addProductWithQuantity(quantity: number) {
    // first fetch any existing product
    let productFetchEntity = new MobileCRM.FetchXml.Entity("product");
    productFetchEntity.addAttributes();
    // order fetch results in descending price way
    productFetchEntity.orderBy("price", true);

    let fetch = new MobileCRM.FetchXml.Fetch(productFetchEntity);
    fetch.execute("DynamicEntities", (res) => {
        if (res.length < 1)
            MobileCRM.bridge.alert("Not any product was found.");
        else {
            let product = res[0] as MobileCRM.DynamicEntity;
            // Add product to collection
            // we can use Dynamic entity as parameter, since it extends the MobileCRM.Reference object. 
            MobileCRM.UI.EntityForm.DetailCollection.addProductWithQuantity(product, quantity, (detail) => {
                // order detail will be updated automatically.
            }, (err) => { MobileCRM.bridge.alert("Failed to add product to sales detail collection.\n\nErr: " + err); }, null);
        }
    }, (err) => { MobileCRM.bridge.alert("Failed to fetch products.\n\nErr: " + err); }, null);
}
