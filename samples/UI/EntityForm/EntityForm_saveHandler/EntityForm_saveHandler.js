/// <reference path="JSBridge.d.ts"/>

/** During onSave event suspend save and call asynchronous fetch method. */
function onSaveHandler() {
    MobileCRM.UI.EntityForm.onSave(function (entityForm) {
        /// Get email field value for validation.
        var editedAccount = entityForm.entity;
        // call 'suspendSave' method to allow another asynchronous method execution.
        var saveHandler = entityForm.suspendSave();
        // create asynchronous fetch method
        var fetchEntity = new MobileCRM.FetchXml.Entity("contact");
        var attribute = new MobileCRM.FetchXml.Attribute("contactid");
        attribute.aggregate = "count";
        attribute.alias = "Contact_cnt";
        fetchEntity.filter = new MobileCRM.FetchXml.Filter();
        fetchEntity.filter.where("parentcustomerid", "eq", editedAccount.id);
        var fetch = new MobileCRM.FetchXml.Fetch(fetchEntity);
        fetch.aggregate = true;
        fetch.execute("DynamicEntities", function (res) {
            if (res[0] > 0)
                saveHandler.resumeSave();
            else
                saveHandler.resumeSave("At least one contact is required");
        }, function (err) { MobileCRM.bridge.alert("Error fetching contact for account.\n\nErr: " + err); }, null);
    }, true, null);
}