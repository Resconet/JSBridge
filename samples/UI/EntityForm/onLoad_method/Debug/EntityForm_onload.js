"use strict";
/// <reference path="JSBridge.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/** Request entity form and set property */
function onLoad() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        /// set address field
        entityForm.entity.properties.address1_city = "77 Massachusetts Ave";
        entityForm.entity.properties.address1_stateorprovince = "MA";
        entityForm.entity.properties.address1_postalcode = "02139";
        entityForm.entity.properties.address1_country = "US";
        // return true to apply changes
        return true;
    }, function (err) { MobileCRM.bridge.alert("Error occured during onload of entity form.\n\nErr: " + err); }, null);
}
exports.onLoad = onLoad;
//# sourceMappingURL=EntityForm_onload.js.map