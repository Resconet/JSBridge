/// <reference path="JSBridge.d.ts"/>

/** Handle on command click and create assoiciated task with open status, if record is new.*/
export function onCommandCreateTask() {
    MobileCRM.UI.EntityForm.onCommand("custom_createTask", (entityForm) => {
        if (!entityForm.entity.isNew) {
            var props = entityForm.entity.properties;
            var task = MobileCRM.DynamicEntity.createNew("task");
            let taskName = "Task [" + entityForm.entity.primaryName + "]";
            // set task properties
            task.properties.subject = taskName;
            task.properties.statecode = 0; // Open status
            task.properties.regardingobjectid = entityForm.entity;
            task.properties.prioritycode = 1; // Normal priority
            task.properties.scheduledstart = new Date().toLocaleDateString();
            task.properties.description = "This task refer to " + entityForm.entity.entityName + "And is created from JSBridge entity form command.";
            // asynchronously save new task
            task.save(function (err) {
                if (err) {
                    MobileCRM.bridge.alert("Create task FAILED.\n\nErr: " + err);
                }
                else { MobileCRM.bridge.alert(taskName + " created successfully."); }
            });
        }
    }, true, null);
}