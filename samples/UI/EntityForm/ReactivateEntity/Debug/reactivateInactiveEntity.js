/// <reference path="JSBridge.d.ts"/>
function reactivateEntity() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        if (entityForm.entity.properties.statecode == 1) // check whether entity is inactive
            MobileCRM.UI.EntityForm.reactivateEntity(0); // Active status code
    }, MobileCRM.bridge.alert, null);
}
//# sourceMappingURL=reactivateInactiveEntity.js.map