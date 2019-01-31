/// <reference path="JSBridge.d.ts"/>
/** Request entity form and insert all types of custom detail view items on custom view 'Items' */
function createDetailViewItems() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        /// Get detail view with name 'Custom Items'
        var detailView = entityForm.getDetailView("Items");
        if (detailView) {
            /// create new array object to store detail view items
            var newItems = new Array();
            // Create separator item to split Default items and custom
            var separator = new MobileCRM.UI.DetailViewItems.SeparatorItem();
            separator.name = "separator";
            separator.value = "Custom DetailView items";
            newItems.push(separator);
            var textItem = new MobileCRM.UI.DetailViewItems.TextBoxItem();
            textItem.name = "TextItem";
            textItem.label = "Text";
            textItem.value = "Text 'ABC'";
            // Set number of lines > 1 to make a multi line
            textItem.numberOfLines = 1;
            // Set this field as required and set message in case if the value is empty
            textItem.errorMessage = "Label must not be empty";
            textItem.validate = true;
            // The value kind (Text=0, Email=1, Url=2, Phone=3, Barcode=4).
            textItem.kind = 0;
            // Text that is displayed in the control until the value is changed by a user action or some other operation.
            textItem.placeholderText = "Here set the text";
            // push new item to array
            newItems.push(textItem);
            var numItem = new MobileCRM.UI.DetailViewItems.NumericItem();
            numItem.name = "NumericItem";
            numItem.label = "Custom Discount";
            numItem.decimalPlaces = 2;
            numItem.minimum = 2.0;
            numItem.maximum = 100.0;
            numItem.value = 55.33;
            newItems.push(numItem);
            var checkBoxItem = new MobileCRM.UI.DetailViewItems.CheckBoxItem();
            checkBoxItem.name = "CheckBoxItem";
            checkBoxItem.label = "Use discount ?";
            checkBoxItem.value = true;
            checkBoxItem.textChecked = "Yes";
            checkBoxItem.textUnchecked = "No";
            checkBoxItem.isNullable = false;
            newItems.push(checkBoxItem);
            var dateItem = new MobileCRM.UI.DetailViewItems.DateTimeItem();
            dateItem.label = "Current Date";
            dateItem.name = "DateItem";
            dateItem.value = new Date();
            // sets whether to display and edit the date, time or both.
            dateItem.parts = 1;
            dateItem.minimum = new Date('2019-01-20');
            dateItem.maximum = new Date('2022-06-28');
            newItems.push(dateItem);
            var comboItem = new MobileCRM.UI.DetailViewItems.ComboBoxItem();
            comboItem.name = "ComboBoxItem";
            comboItem.label = "Select option";
            // Set Desired String Key - Value pair object as data source
            comboItem.listDataSource = { "Option1": "One", "Option2": "Two" };
            comboItem.value = "Two";
            newItems.push(comboItem);
            // Insert all custom DetailView items to 'General' detail view
            // if you use -1 as index, items will be added from last default view item index
            // Otherwise you can set desired index.
            detailView.insertItems(newItems, -1);
        }
        else
            MobileCRM.bridge.alert("View 'Items' is not defined");
    }, MobileCRM.bridge.alert, null);
}
/** Create Link detail view items on view 'Items' */
function createLinkDetailItems() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        /// Get detail view with name 'Custom Items'
        var detailView = entityForm.getDetailView("Items");
        if (detailView) {
            // if items with name 'linkHrefItem' and 'linkRefItem' exist, remove them
            var ind1 = detailView.getItemIndex("linkHrefItem");
            if (ind1 && ind1 > -1) {
                detailView.removeItem(ind1);
                var linkHrefItem = new MobileCRM.UI.DetailViewItems.LinkItem();
                linkHrefItem.name = "linkHrefItem";
                linkHrefItem.label = "Web";
                linkHrefItem.value = "Google";
                // Handle click on this link item and open google page outside of application in default browser.
                detailView.registerClickHandler(linkHrefItem, function (itemName) {
                    if (itemName === linkHrefItem.name)
                        MobileCRM.Platform.openUrl("http://wwww.google.com");
                });
                detailView.insertItem(linkHrefItem, -1);
            }
            var ind2 = detailView.getItemIndex("linkRefItem");
            if (ind2 && ind2 > -1) {
                detailView.removeItem(ind2);
                var linkRefItem = new MobileCRM.UI.DetailViewItems.LinkItem();
                linkRefItem.name = "linkRefItem";
                linkRefItem.label = "Reference";
                // Set value to null or any valid MobileCRM.Reference object
                // If value is 'null' reference, then displayed value is 'Click To Select...'
                // Otherwise 'primaryName' of MobileCRM.Reference will be displayed.
                linkRefItem.value = undefined; // new MobileCRM.Reference(null, null, null);
                detailView.registerClickHandler(linkRefItem, function (itemName, detailView) {
                    if (itemName === linkRefItem.name) {
                        MobileCRM.bridge.alert("You clicked on " + itemName);
                        /// HINTS: Here you can implement own custom logic similar to lookup, or open record using reference
                        var refValue = linkRefItem.value;
                        if (refValue)
                            MobileCRM.UI.FormManager.showEditDialog(refValue.entityName, refValue.id);
                    }
                });
                detailView.insertItem(linkRefItem, -1);
            }
        }
        else
            MobileCRM.bridge.alert("View 'Items' is not defined");
    }, MobileCRM.bridge.alert, null);
}
/** Remove all detail items on detail view with name 'Items' */
function removeDetailViewItems() {
    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
        /// Get detail view with name 'Custom Items'
        var detailView = entityForm.getDetailView("Items");
        //collect indexes of items to remove
        var indexes = new Array();
        for (var i in detailView.items)
            indexes.push(i);
        if (indexes.length > 0)
            detailView.removeItems(indexes);
    }, MobileCRM.bridge.alert, null);
}
//# sourceMappingURL=DetailView.js.map