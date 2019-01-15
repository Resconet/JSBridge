"use strict";
/// <reference path="JSBridge.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/** Handle on command click and create assoiciated task with open status, if record is new.*/
function onCommandCreateTask() {
    MobileCRM.UI.EntityForm.onCommand("custom_createTask", function (entityForm) {
        if (!entityForm.entity.isNew) {
            var props = entityForm.entity.properties;
            var task = MobileCRM.DynamicEntity.createNew("task");
            var taskName_1 = "Task [" + entityForm.entity.primaryName + "]";
            // set task properties
            task.properties.subject = taskName_1;
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
                else {
                    MobileCRM.bridge.alert(taskName_1 + " created successfully.");
                }
            });
        }
    }, true, null);
}
exports.onCommandCreateTask = onCommandCreateTask;
//# sourceMappingURL=EntityForm_onCommand.js.map