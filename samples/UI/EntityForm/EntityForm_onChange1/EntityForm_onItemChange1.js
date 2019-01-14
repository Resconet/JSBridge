"use strict";
/// <reference path="JSBridge.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/** Handle onchange event of 'address1_city' field on entity form. */
function onItemChange() {
    MobileCRM.UI.EntityForm.onItemChange("address1_city", function (entityForm) {
        var context = entityForm.context;
        // clear all additional address fields
        entityForm.entity.properties.address1_stateprovince = undefined;
        entityForm.entity.properties.address1_country = undefined;
        entityForm.entity.properties.address1_postalcode = undefined;
    }, true, null);
}
exports.onItemChange = onItemChange;
//# sourceMappingURL=EntityForm_onItemChange1.js.map