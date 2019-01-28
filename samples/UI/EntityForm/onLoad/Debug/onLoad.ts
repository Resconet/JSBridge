/// <reference path="JSBridge.d.ts"/>

/** Request entity form and set property */
function onLoadSetAddress() {
    MobileCRM.UI.EntityForm.requestObject((entityForm) => {
        /// set address field
        entityForm.entity.properties.address1_city = "77 Massachusetts Ave";
        entityForm.entity.properties.address1_stateprovince = "MA";
        entityForm.entity.properties.address1_postalcode = "02139";
        entityForm.entity.properties.address1_country = "US";
        // return true to apply changes
        return true;
    }, (err) => { MobileCRM.bridge.alert("Error occured during onload of entity form.\n\nErr: " + err); }, null);
}
/** Load parent account and set current email of child with the same value */
function loadParentAccount() {
    MobileCRM.UI.EntityForm.requestObject((entityForm) => {
        let entity = entityForm.entity;
        // Get Parent customer field from entity.
        let parentCustomer = entity.properties.prentcustomerid as MobileCRM.Reference;

        // Only in case if parent customer field is not empty
        if (parentCustomer) {
            // load associated Parent record
            let contact = new MobileCRM.FetchXml.Entity(parentCustomer.entityName);
            contact.addAttributes();

            // filter contacts only for current entity
            let filter = new MobileCRM.FetchXml.Filter();
            filter.where("accountid", "eq", parentCustomer.id);

            contact.filter = filter;

            let fetch = new MobileCRM.FetchXml.Fetch(contact);
            fetch.execute("DynamicEntities", (res) => {
                if (res.length > 1) {
                    let parentEntity = res[0] as MobileCRM.DynamicEntity;
                    let emailAddress = parentEntity.properties.emailaddress1;
                    if (emailAddress) {
                        // In case if we want to make changes on entity form
                        // Request entity form again to make sure we will works with current context of entity form

                        MobileCRM.UI.EntityForm.requestObject((entityForm) => {
                            // get entity form email address detail item.
                            // disable this item for any further changes and set email from parent.
                            var dv = entityForm.getDetailView("General");
                            if (dv) {
                                var item = dv.getItemByName("emailaddress1");
                                if (item) {
                                    item.value = emailAddress;
                                    item.isEnabled = false;
                                    return true;
                                }
                            }
                        }, MobileCRM.bridge.alert, null);
                    }
                }
            }, (err) => { MobileCRM.bridge.alert("Failed to fetch contacts.\n\nErr: " + err); }, null);
            return true;
        }
    }, (err) => { MobileCRM.bridge.alert("Error occured during onload of entity form.\n\nErr: " + err); }, null);
}

// Register handlers during onload phase
window.onload = () => {
    onLoadSetAddress();
    loadParentAccount();
}

