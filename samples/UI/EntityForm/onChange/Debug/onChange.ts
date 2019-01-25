/// <reference path="JSBridge.d.ts"/>

/** on Change parent customer field, set parent telephone number */
function setParentPhoneOnChange() {
    MobileCRM.UI.EntityForm.onChange((entityForm) => {
        // Get context of entityForm
        let context = entityForm.context as MobileCRM.UI.IFormChangeContext;
        if (context.changedItem == "parentcustomerid") {
            /// asynchronously load parent entity and update main phone with current record phone
            let parentcustomerRef = entityForm.entity.properties.parentcustomerid as MobileCRM.Reference;
            let mainphone = entityForm.entity.properties.telephone1;

            /// Asynchronously load parent customer and set telephone number
            MobileCRM.DynamicEntity.loadById(parentcustomerRef.entityName, parentcustomerRef.id, (parent) => {
                // if telephone is not the same already, change and save.
                if (mainphone !== parent.properties.telephone1) {
                    parent.properties.telephone1 = mainphone;
                    // Asynchronously Save changed property
                    parent.save((err) => {
                        if (err) MobileCRM.bridge.alert(err);
                        else { MobileCRM.bridge.alert("Parent customer successfully updated."); }
                    });
                }
            }, (err) => { MobileCRM.bridge.alert("Failed to load parent customer " + MobileCRM.bridge.alert(JSON.stringify(parentcustomerRef) + "\n\nErr: " + err)); }, null);
        }
    }, true, null);
}
/** Handle specific item change event. */
function clearAddressOnItemChange() {
    MobileCRM.UI.EntityForm.onItemChange("address1_city", (entityForm) => {
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
}