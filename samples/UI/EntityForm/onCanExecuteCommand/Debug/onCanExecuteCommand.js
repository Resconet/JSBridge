/// <reference path="JSBridge.d.ts"/>
/** Set whether command 'Won' can be executed or not*/
function canWonOpportunity() {
    MobileCRM.UI.EntityForm.onCanExecuteCommand("WonOpportunity", function (entityForm) {
        /// Enable command 'Won' only if opportunity rating code is 'Hot' and estimated value is grater than 10
        return (entityForm.entity.properties.opportunityratingcode == 1 && entityForm.entity.properties.estimatedvalue > 100);
    }, true, null);
}
/** Handle EntityForm onchange event to set whether 'Won' command can be executed or not. */
function onChange() {
    MobileCRM.UI.EntityForm.onChange(function (entityForm) {
        var change = entityForm.context;
        if (change.changedItem == "opportunityratingcode" || change.changedItem == "estimatedvalue")
            canWonOpportunity();
    }, true, null);
}
window.onload = function () { onChange(); canWonOpportunity(); };
//# sourceMappingURL=onCanExecuteCommand.js.map