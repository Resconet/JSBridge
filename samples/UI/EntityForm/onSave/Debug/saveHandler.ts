/// <reference path="JSBridge.d.ts"/>

/** During onSave event suspend save and call asynchronous fetch method. */
function onSaveHandler() {
    MobileCRM.UI.EntityForm.onSave((entityForm) => {
        let editedAccount = entityForm.entity;

        // call 'suspendSave' method to allow another asynchronous method execution.
        let saveHandler = entityForm.suspendSave();

        // create asynchronous fetch method
        let fetchEntity = new MobileCRM.FetchXml.Entity("contact");
        let attribute = new MobileCRM.FetchXml.Attribute("contactid");
        attribute.aggregate = "count";
        attribute.alias = "Contact_cnt";

        fetchEntity.attributes.push(attribute);
        fetchEntity.filter = new MobileCRM.FetchXml.Filter();
        fetchEntity.filter.where("parentcustomerid", "eq", editedAccount.id);

        let fetch = new MobileCRM.FetchXml.Fetch(fetchEntity);
        fetch.aggregate = true;
        fetch.execute("DynamicEntities", (res) => {
            if (res[0] > 0)
                saveHandler.resumeSave();
            else
                saveHandler.resumeSave("At least one contact is required");
        }, (err) => { MobileCRM.bridge.alert("Error fetching contact for account.\n\nErr: " + err); }, null);

    }, true, null);
}
