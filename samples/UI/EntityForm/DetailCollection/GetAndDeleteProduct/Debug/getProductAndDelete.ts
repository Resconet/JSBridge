/// <reference path="JSBridge.d.ts"/>

/**
 * Get most expensive product and delete it from sales detail collection
 * @param deleteById If <c>true</c> deleteById method will be used otherwise we use deleteByIndex method.
 */
function getProductAndDelete(deleteById: boolean) {
    MobileCRM.UI.EntityForm.DetailCollection.getAll((details) => {
        if (details.length > 0) {
            /// find most expansive product
            details.sort((d1, d2) => { return d2.properties.totalmount - d1.properties.totalamount; });
            details.sort((d1, d2) => { return d1.properties.totalmount - d2.properties.totalamount; });
            let product = details[details.length - 1] as MobileCRM.DynamicEntity;

            if (deleteById) {
                MobileCRM.UI.EntityForm.DetailCollection.deleteById(product.id, () => {
                    /// success void callback
                    MobileCRM.bridge.alert("Success to delete most expansive product in the collection [" + product.properties.productname + "].");
                }, (err) => { MobileCRM.bridge.alert("Failed to delete product [" + product.properties.productname + "]\n\nErr: " + err); });
            }
            else {
                // delete the product by index
                MobileCRM.UI.EntityForm.DetailCollection.deleteByIndex(details.length - 1, () => {
                    /// success void callback
                    MobileCRM.bridge.alert("Success to delete most expansive product in the collection [" + product.properties.productname + "].");
                }, (err) => { MobileCRM.bridge.alert("Failed to delete product [" + product.properties.productname + "]\n\nErr: " + err); });
            }
        }
    }, (err) => {
        MobileCRM.bridge.alert("Failed to retrieve detail collection.\n\nErr: " + err);
    }, null);
}
