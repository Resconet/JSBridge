/// <reference path="JSBridge.d.ts"/>
/**
 * Get the most expensive product and delete it from sales detail collection
 * @param deleteById If <c>true</c> deleteById method will be used otherwise we use deleteByIndex method.
 */
function getProductAndDelete(deleteById) {
    MobileCRM.UI.EntityForm.DetailCollection.getAll(function (details) {
        if (details.length > 0) {
            /// find most expansive product
            details.sort(function (d1, d2) { return d2.properties.totalmount - d1.properties.totalamount; });
            details.sort(function (d1, d2) { return d1.properties.totalmount - d2.properties.totalamount; });
            var product_1 = details[details.length - 1];
            if (deleteById) {
                MobileCRM.UI.EntityForm.DetailCollection.deleteById(product_1.id, function () {
                    /// success void callback
                    MobileCRM.bridge.alert("Success to delete most expansive product in the collection [" + product_1.properties.productname + "].");
                }, function (err) { MobileCRM.bridge.alert("Failed to delete product [" + product_1.properties.productname + "]\n\nErr: " + err); });
            }
            else {
                // delete the product by index
                MobileCRM.UI.EntityForm.DetailCollection.deleteByIndex(details.length - 1, function () {
                    /// success void callback
                    MobileCRM.bridge.alert("Success to delete most expansive product in the collection [" + product_1.properties.productname + "].");
                }, function (err) { MobileCRM.bridge.alert("Failed to delete product [" + product_1.properties.productname + "]\n\nErr: " + err); });
            }
        }
    }, function (err) {
        MobileCRM.bridge.alert("Failed to retrieve detail collection.\n\nErr: " + err);
    }, null);
}
//# sourceMappingURL=getProductAndDelete.js.map
