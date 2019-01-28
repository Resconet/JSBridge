/// <reference path="JSBridge.d.ts"/>

/** Create appointment entity after entity was saved. */
function createAppointmentAfterSave() {
    MobileCRM.UI.EntityForm.onPostSave((entityForm) => {
        let entity = entityForm.entity;
        // post save method to run another asynchronous operation
        // create new task from newly created entity
        let postSaveHandler = entityForm.suspendPostSave();
        let appointment = MobileCRM.DynamicEntity.createNew("appointment");
        appointment.properties.regardingobjectid = entity;
        appointment.properties.scheduledstart = new Date().toLocaleDateString();
        // scheduled end will be set automatically by system as scheduled start + 1 one hour
        appointment.properties.subject = "Please visit this customer: " + entityForm.entity.primaryName;
        appointment.properties.statecode = 3; // Set status as scheduled

        appointment.save((err) => {
            if (err) MobileCRM.bridge.alert("Failed to create appointment.\n\nErr:" + err);
            // In all cases don't forget to resume post save method.
            // resume post save handler to finish saving
            postSaveHandler.resumePostSave();
        });

    }, true, null);
}

/** Register event during on-load event of entity form. */
window.onload = () => {
    createAppointmentAfterSave();
}