/// <reference path="JSBridge.d.ts"/>

/** Handle on post save event and create cloned record */
function onPostSaveCreate() {
    MobileCRM.UI.EntityForm.onPostSave((entityForm) => {
        // call suspend post save method to allow another asynchronous method execution.
        let postSaveHandler = entityForm.suspendPostSave();
        let entityProps = entityForm.entity.properties;
        let cloneProps = {} as any;
        //let cloneProps = { name:"", address1_city:"", telephone1:"", emailaddress1:""}
        cloneProps.name = "Cloned" + entityProps.name;
        cloneProps.address1_city = entityProps.address1_city;
        cloneProps.telephone1 = entityProps.telephone1;
        cloneProps.emailaddress1 = entityProps.emailaddress1;
        let cloneEntity = MobileCRM.DynamicEntity.createNew(entityForm.entity.entityName, null, cloneProps.name, cloneProps);
        cloneEntity.save((err) => {
            if (err) MobileCRM.bridge.alert("Create clone entity FAILED!\n\nErr: " + err);
            else postSaveHandler.resumePostSave();
        });
    }, true, null);
}