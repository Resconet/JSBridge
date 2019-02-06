/// <reference path="JSBridge.d.ts"/>

/** Handle event when address tab has been displayed and if City is enabled and visible and value is not defined start edit item.*/
function updateAddressFieldsWhenAddressTabIsVisible() {
    MobileCRM.UI.EntityForm.onSelectedViewChanged((entityForm) => {
        let context = entityForm.context as MobileCRM.UI.IFormChangeContext;
        if (context.selectedView == "Address") {
            let dv = entityForm.getDetailView("Address");
            let cityItem = dv.getItemByName("address1_city");
            if (cityItem && cityItem.isEnabled && cityItem.isVisible && cityItem.value == undefined) {
                dv.startEditItem(dv.getItemIndex("address1_city"));
            }
        }
    }, true, null);
}

window.onload = () => { updateAddressFieldsWhenAddressTabIsVisible(); }