/// <reference path="JSBridge.d.ts"/>

/** Request entity form and set property */
export function onLoad() {
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