/// <reference path="JSBridge.d.ts"/>
        /** Create contact entity after entity was saved. */
        function createContactAfterSave() {
            MobileCRM.UI.EntityForm.onPostSave(
		        function (entityForm) {
                var entity = entityForm.entity;
                // post save method to run another asynchronous operation
                // create new contact from newly created entity
                var postSaveHandler = entityForm.suspendPostSave();
		        var contact = new MobileCRM.DynamicEntity.createNew("contact");
		        contact.properties.lastname = "Child of " + entity.primaryName;
		        contact.properties.firstname = "I am";
		        contact.properties.parentcustomerid = entity;
		        contact.properties.emailaddress1 = "example@example.com";
                contact.save(function (err) {
                    if (err)
                        MobileCRM.bridge.alert("Failed to create contact.\n\nErr:" + err);
                    // In all cases don't forget to resume post save method.
                    // resume post save handler to finish saving
                    postSaveHandler.resumePostSave();
                });
            }, true, MobileCRM.bridge.alert);
        }
        /** Register event during on-load event of entity form. */
        window.onload = function () {
            createContactAfterSave();
        }
//# sourceMappingURL=suspendPostSave.js.map
