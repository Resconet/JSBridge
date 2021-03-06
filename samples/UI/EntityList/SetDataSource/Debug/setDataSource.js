/// <reference path="JSBridge.d.ts"/>
/** Display custom data source by adding filter to default source fetch on account entity view. */
function setDataSource() {
    var dataSource = new MobileCRM.UI.ListDataSource();
    // loadNextChunk method must be implemented explicitly
    dataSource.loadNextChunk = function (page, count) {
        var fetch = this.fetch; // Take a fetch provided for current entity view
        // Specify explicit page and count requested by application (optional - it's pre-set before this method is called).
        fetch.count = count;
        fetch.page = page;
        if (page === 1) {
            // Specify custom filter or link entities.
            // Do it just for the first page!
            // WARNING: Do not add new attributes to the fetch - they will be ignored.
            var filter = new MobileCRM.FetchXml.Filter();
            var parentNotNullCondition = new MobileCRM.FetchXml.Condition();
            parentNotNullCondition.attribute = "accountid";
            parentNotNullCondition.operator = "not-null";
            var conditionStartsWith = new MobileCRM.FetchXml.Condition();
            conditionStartsWith.attribute = "name";
            conditionStartsWith.operator = "like";
            conditionStartsWith.value = "Amazing%";
            filter.conditions.push(parentNotNullCondition, conditionStartsWith);
            filter.type = "and";
            var originalFilter = fetch.entity.filter;
            if (originalFilter && originalFilter.conditions.length > 0) {
                // Combine new filter with original filter which came from the view definition.
                var combinedFilter = new MobileCRM.FetchXml.Filter();
                combinedFilter.type = "and";
                combinedFilter.filters = [filter, originalFilter];
                fetch.entity.filter = combinedFilter;
            }
            else
                fetch.entity.filter = filter; // Set the new filter to fetch entity
        }
        // Execute fetch asynchronously and force the output type DynamicEntities.
        // When the array of DynamicEntity objects is ready, call chunkReady (don't forget to call it in scope of this ListDataSource).
        fetch.execute("DynamicEntities", function (entities) {
            // This is the final place to manipulate with the array of loaded entities before it is passed to the EntityList.
            this.chunkReady(entities); // Callback is called in scope of our dataSource, so we can call it's method chunkReady to pass the data.
        }, MobileCRM.bridge.alert, this);
    };
    MobileCRM.UI.EntityList.setDataSource(dataSource);
}
window.onload = function () {
    /** If iFrame property 'Provide data source' is not checked it will be ignored*/
    setDataSource();
};
//# sourceMappingURL=setDataSource.js.map