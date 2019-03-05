/// <reference path="JSBridge.d.ts"/>
/**
 * Get the most expensive product and delete it from sales detail collection
 * @param deleteById If <c>true</c> deleteById method will be used otherwise we use deleteByIndex method.
 */
function getProductAndDelete(deleteById) {
    MobileCRM.UI.EntityForm.DetailCollection.getAll(function (details) {
        if (details.length > 0) {
            /// find most expansive product
            details.sort(function (d1, d2) { return (d1.properties.priceperunit > d2.properties.priceperunit) ? 1 : ((d2.properties.priceperunit > d1.properties.priceperunit) ? -1 : 0); });
            var product_1 = details[details.length - 1];
            if (deleteById) {
                MobileCRM.UI.EntityForm.DetailCollection.deleteById(product_1.id, function () {
                    /// success void callback
                    MobileCRM.bridge.alert("Success to delete most expansive product in the collection [" + product_1.properties.productname + "].");
                }, function (err) { MobileCRM.bridge.alert("Failed to delete product [" + product_1.properties.productname + "]\n\nErr: " + err); });
            }
            else {
                // delete the last product by index
				MobileCRM.UI.EntityForm.DetailCollection.deleteByIndex(details.length - 1, function () {
					/// success void callback
					MobileCRM.bridge.alert("Success to delete last product in the collection.");
				}, function (err) { MobileCRM.bridge.alert("Failed to delete last product in the collection." + err); });
            }
        }
    }, function (err) {
        MobileCRM.bridge.alert("Failed to retrieve detail collection.\n\nErr: " + err);
    }, null);
}
//# sourceMappingURL=getProductAndDelete.js.map
