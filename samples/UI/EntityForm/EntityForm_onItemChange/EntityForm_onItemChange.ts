/// <reference path="JSBridge.d.ts"/>

/** Handle onchange event of 'address1_city' field on entity form. */
export function onItemChange() {
    MobileCRM.UI.EntityForm.onItemChange("address1_city", (entityForm) => {
        let context = entityForm.context as MobileCRM.UI.IFormChangeContext;
        // clear all additional address fields
        entityForm.entity.properties.address1_stateprovince = undefined;
        entityForm.entity.properties.address1_country = undefined;
        entityForm.entity.properties.address1_postalcode = undefined;
    }, true, null);
}
