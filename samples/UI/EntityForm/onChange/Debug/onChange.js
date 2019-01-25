/// <reference path="JSBridge.d.ts"/>
/** on Change parent customer field, set parent telephone number */
function setParentPhoneOnChange() {
    MobileCRM.UI.EntityForm.onChange(function (entityForm) {
        // Get context of entityForm
        var context = entityForm.context;
        if (context.changedItem == "parentcustomerid") {
            /// asynchronously load parent entity and update main phone with current record phone
            var parentcustomerRef_1 = entityForm.entity.properties.parentcustomerid;
            var mainphone_1 = entityForm.entity.properties.telephone1;
            /// Asynchronously load parent customer and set telephone number
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
            }, function (err) { MobileCRM.bridge.alert("Failed to load parent customer " + MobileCRM.bridge.alert(JSON.stringify(parentcustomerRef_1) + "\n\nErr: " + err)); }, null);
        }
    }, true, null);
}
/** Handle specific item change event. */
function clearAddressOnItemChange() {
    MobileCRM.UI.EntityForm.onItemChange("address1_city", function (entityForm) {
        // clear all additional address fields
        entityForm.entity.properties.address1_stateprovince = undefined;
        entityForm.entity.properties.address1_country = undefined;
        entityForm.entity.properties.address1_postalcode = undefined;
    }, true, null);
}
window.onload = function () {
    // Register onChange event handlers during onload.
    setParentPhoneOnChange();
    clearAddressOnItemChange();
};
//# sourceMappingURL=onChange.js.map