/// <reference path="JSBridge.d.ts"/>
/** Request entity form and set property */
function onLoadSetAddress() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        /// set address field
        entityForm.entity.properties.address1_city = "77 Massachusetts Ave";
        entityForm.entity.properties.address1_stateprovince = "MA";
        entityForm.entity.properties.address1_postalcode = "02139";
        entityForm.entity.properties.address1_country = "US";
        // return true to apply changes
        return true;
    }, function (err) { MobileCRM.bridge.alert("Error occured during onload of entity form.\n\nErr: " + err); }, null);
}
/** Load parent account and set current email of child with the same value */
function loadParentAccount() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        var entity = entityForm.entity;
        // Get Parent customer field from entity.
        var parentCustomer = entity.properties.prentcustomerid;
        // Only in case if parent customer field is not empty
        if (parentCustomer) {
            // load associated Parent record
            var contact = new MobileCRM.FetchXml.Entity(parentCustomer.entityName);
            contact.addAttributes();
            // filter contacts only for current entity
            var filter = new MobileCRM.FetchXml.Filter();
            filter.where("accountid", "eq", parentCustomer.id);
            contact.filter = filter;
            var fetch_1 = new MobileCRM.FetchXml.Fetch(contact);
            fetch_1.execute("DynamicEntities", function (res) {
                if (res.length > 1) {
                    var parentEntity = res[0];
                    var emailAddress_1 = parentEntity.properties.emailaddress1;
                    if (emailAddress_1) {
                        // In case if we want to make changes on entity form
                        // Request entity form again to make sure we will works with current context of entity form
                        MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
                            // get entity form email address detail item.
                            // disable this item for any further changes and set email from parent.
                            var dv = entityForm.getDetailView("General");
                            if (dv) {
                                var item = dv.getItemByName("emailaddress1");
                                if (item) {
                                    item.value = emailAddress_1;
                                    item.isEnabled = false;
                                    return true;
                                }
                            }
                        }, MobileCRM.bridge.alert, null);
                    }
                }
            }, function (err) { MobileCRM.bridge.alert("Failed to fetch contacts.\n\nErr: " + err); }, null);
            return true;
        }
    }, function (err) { MobileCRM.bridge.alert("Error occured during onload of entity form.\n\nErr: " + err); }, null);
}
// Register handlers during onload phase
window.onload = function () {
    onLoadSetAddress();
    loadParentAccount();
};
//# sourceMappingURL=onLoad.js.map