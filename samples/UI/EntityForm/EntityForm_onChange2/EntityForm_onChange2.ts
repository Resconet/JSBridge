/// <reference path="JSBridge.d.ts"/>

/** Handle onChange event of 'parentcustomerid' to set the phone number from current record to parent*/
export function onChange2() {
    MobileCRM.UI.EntityForm.onChange((entityForm) => {
        let context = entityForm.context as MobileCRM.UI.IFormChangeContext;
        if (context.changedItem == "parentcustomerid") {
            /// asynchronously load parent entity and update main phone with current record phone
            let parentcustomerRef = entityForm.entity.properties.parentcustomerid as MobileCRM.Reference;
            let mainphone = entityForm.entity.properties.telephone1;
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
            }, (err) => { MobileCRM.bridge.alert("Failed to load parentcustomer " + JSON.stringify(parentcustomerRef) + "\n\nErr: " + err); }, null);
        }
    }, true, null);
}