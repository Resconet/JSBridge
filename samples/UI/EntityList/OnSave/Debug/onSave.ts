/// <reference path="JSBridge.d.ts"/>

/**
 * Validate 'Text-Edit' kind property 'fax' on edited entities during on save event.
 * @param register if 'true' handler is bound.
 */
function validateFaxPropertyOnSave(register: boolean) {
	MobileCRM.UI.EntityList.onSave(entityList => {
		let editedEntities = entityList.context.entities;		let saveHandler = entityList.suspendSave();		let errMsg = "";		for (var i in editedEntities) {			var entity = editedEntities[i];			if (entity.properties.fax.length < 3) {				errMsg += "Record : [" + entity.primaryName + "] has short fax\n";			}		}		saveHandler.resumeSave(errMsg);
	}, register, null);
}
/** Register onSave event handler when page is loaded. */
window.onload = () => {
	validateFaxPropertyOnSave(true);
}