/// <reference path="JSBridge.d.ts"/>
/** Handle event when address tab has been displayed and if City is enabled and visible and value is not defined start edit item.*/
function updateAddressFieldsWhenAddressTabIsVisible() {
    MobileCRM.UI.EntityForm.onSelectedViewChanged(function (entityForm) {
        var context = entityForm.context;
        if (context.selectedView == "Address") {
            var dv = entityForm.getDetailView("Address");
            var cityItem = dv.getItemByName("address1_city");
            if (cityItem && cityItem.isEnabled && cityItem.isVisible && cityItem.value == undefined) {
                dv.startEditItem(dv.getItemIndex("address1_city"));
            }
        }
    }, true, null);
}
window.onload = function () { updateAddressFieldsWhenAddressTabIsVisible(); };
//# sourceMappingURL=onSelectedViewChanged.js.map