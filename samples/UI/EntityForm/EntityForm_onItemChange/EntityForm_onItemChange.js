/// <reference path="JSBridge.d.ts"/>

/** Handle onchange event of 'address1_city' field on entity form. */
function onItemChange() {
    MobileCRM.UI.EntityForm.onItemChange("address1_city", function (entityForm) {
        var context = entityForm.context;
        // clear all additional address fields
        entityForm.entity.properties.address1_stateorprovince = undefined;
        entityForm.entity.properties.address1_country = undefined;
        entityForm.entity.properties.address1_postalcode = undefined;
    }, true, null);
}