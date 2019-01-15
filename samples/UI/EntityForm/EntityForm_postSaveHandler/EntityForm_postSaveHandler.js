"use strict";
/// <reference path="JSBridge.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/** Handle on post save event and create cloned record */
function onPostSaveCreate() {
    MobileCRM.UI.EntityForm.onPostSave(function (entityForm) {
        // call suspend post save method to allow another asynchronous method execution.
        var postSaveHandler = entityForm.suspendPostSave();
        var entityProps = entityForm.entity.properties;
        var cloneProps = {};
        //let cloneProps = { name:"", address1_city:"", telephone1:"", emailaddress1:""}
        cloneProps.name = "Cloned" + entityProps.name;
        cloneProps.address1_city = entityProps.address1_city;
        cloneProps.telephone1 = entityProps.telephone1;
        cloneProps.emailaddress1 = entityProps.emailaddress1;
        var cloneEntity = MobileCRM.DynamicEntity.createNew(entityForm.entity.entityName, null, cloneProps.name, cloneProps);
        cloneEntity.save(function (err) {
            if (err)
                MobileCRM.bridge.alert("Create clone entity FAILED!\n\nErr: " + err);
            else
                postSaveHandler.resumePostSave();
        });
    }, true, null);
}
exports.onPostSaveCreate = onPostSaveCreate;
//# sourceMappingURL=EntityForm_postSaveHandler.js.map