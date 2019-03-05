/// <reference path="JSBridge.d.ts"/>

/** Select Product tab on sales order entity form using static method */
function selectProductTab() {
    let tabName = "product.salesorderid.salesorder";

    MobileCRM.UI.EntityForm.selectTabEx(tabName, null, null);
}

/** Select product tab on sales order entity form and maximize view 
 * @requires flexi form to be enabled (new UI).
 */
function selectViewAndMaximizeProductTab() {
    MobileCRM.UI.EntityForm.requestObject((entityForm) => {
        let tabName = "product.salesorderid.salesorder";
        entityForm.selectView(tabName, "Default");
        MobileCRM.UI.EntityForm.isViewMaximized("Default", (isMaximized) => {
            if (!isMaximized)
                MobileCRM.UI.EntityForm.maximizeView("Default", !isMaximized);
        }, MobileCRM.bridge.alert, null);
    }, (err) => { MobileCRM.bridge.alert("Error occurred while requesting entityForm object.\n\nErr: " + err); }, null);
}

/** Select custom iFrame tab with name 'Web page' and maximize form if can be maximized */
function selectTabAndMaximizeForm() {
    /// use static method to select tab
    // custom iFrame on entityForm
    let tabName = "Web page";

    MobileCRM.UI.EntityForm.requestObject((entityForm) => {
        entityForm.selectTab(tabName, (err) => { MobileCRM.bridge.alert("Unable to select Tab '" + tabName + "'.\n\nErr: " + err); }, null);
        if (entityForm.form.canMaximize && !entityForm.form.isMaximized) {
            entityForm.form.isMaximized = true;
        }
    }, (err) => { MobileCRM.bridge.alert("Error occurred while requesting entityForm object.\n\nErr: " + err); }, null);
}
