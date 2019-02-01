/// <reference path="JSBridge.d.ts"/>
/** Select Product tab on sales order entity form using static method */
function selectProductTab() {
    var tabName = "product.salesorderid.salesorder";
    MobileCRM.UI.EntityForm.selectTabEx(tabName, function (err) { MobileCRM.bridge.alert("Unable to select Tab 'products'.\n\nErr: " + err); }, null);
}
/** Select product tab on sales order entity form and maximize view
 * @requires flexi form to be enabled (new UI).
 */
function selectViewAndMaximizeProductTab() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        var tabName = "product.salesorderid.salesorder";
        entityForm.selectView(tabName, "Default");
        MobileCRM.UI.EntityForm.isViewMaximized("Default", function (isMaximized) {
            if (!isMaximized)
                MobileCRM.UI.EntityForm.maximizeView("Default", !isMaximized);
        }, MobileCRM.bridge.alert, null);
    }, function (err) { MobileCRM.bridge.alert("Error occurred while requesting entityForm object.\n\nErr: " + err); }, null);
}
/** Select custom iFrame tab with name 'Web page' and maximize form if can be maximized */
function selectTabAndMaximizeForm() {
    /// use static method to select tab
    // custom iFrame on entityForm
    var tabName = "Web page";
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        entityForm.selectTab(tabName, function (err) { MobileCRM.bridge.alert("Unable to select Tab '" + tabName + "'.\n\nErr: " + err); }, null);
        if (entityForm.form.canMaximize && !entityForm.form.isMaximized) {
            entityForm.form.isMaximized = true;
        }
    }, function (err) { MobileCRM.bridge.alert("Error occurred while requesting entityForm object.\n\nErr: " + err); }, null);
}
//# sourceMappingURL=SelectTabAndView.js.map