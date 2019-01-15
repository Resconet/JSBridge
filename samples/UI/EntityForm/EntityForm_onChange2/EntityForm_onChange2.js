"use strict";
/// <reference path="JSBridge.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/** Handle onChange event of 'parentcustomerid' to set the phone number from current record to parent*/
function onChange2() {
    MobileCRM.UI.EntityForm.onChange(function (entityForm) {
        var context = entityForm.context;
        if (context.changedItem == "parentcustomerid") {
            /// asynchronously load parent entity and update main phone with current record phone
            var parentcustomerRef_1 = entityForm.entity.properties.parentcustomerid;
            var mainphone_1 = entityForm.entity.properties.telephone1;
            MobileCRM.DynamicEntity.loadById(parentcustomerRef_1.entityName, parentcustomerRef_1.id, function (parent) {
                // if telephone is not the same already, change and save.
                if (mainphone_1 !== parent.properties.telephone1) {
                    parent.properties.telephone1 = mainphone_1;
                    // Asynchronously Save changed property
                    parent.save(function (err) {
                        if (err)
                            MobileCRM.bridge.alert(err);
                        else {
                            MobileCRM.bridge.alert("Parent customer successfully updated.");
                        }
                    });
                }
            }, function (err) { MobileCRM.bridge.alert("Failed to load parentcustomer " + JSON.stringify(parentcustomerRef_1) + "\n\nErr: " + err); }, null);
        }
    }, true, null);
}
exports.onChange2 = onChange2;
//# sourceMappingURL=EntityForm_onChange2.js.map