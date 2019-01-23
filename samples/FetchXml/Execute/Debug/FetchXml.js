/// <reference path="JSBridge.d.ts"/>
function executeFromXml(resultFormat) {
    var xmlFetch = "<fetch resultformat='" + resultFormat + "' aggregate='false'>" +
        "<entity name='salesorder'>" +
        "<attribute name='name' />" +
        "<attribute name='shipto_city' />" +
        "<attribute name='shipto_line1' />" +
        "<attribute name='totalamount' />" +
        "<filter>" +
        "<condition attribute='name' operator='like' value='Bike%'  />" +
        "<condition attribute='totalamount' operator='gt' value='1500'  />" +
        "</filter>" +
        "</entity>" +
        "</fetch>";
    ;
    MobileCRM.FetchXml.Fetch.executeFromXML(xmlFetch, function (result) {
        if (result.length < 1) {
            MobileCRM.bridge.alert("Not any order begins with 'Bike' and total amount grater than 1500 was found");
        }
        else {
            var info = "Info [Missing ship - to address]: \n";
            switch (resultFormat) {
                case "Array":
                    for (var i in result) {
                        var entity = result[i];
                        /// Append orders what doesn't have filled 'ship to address' to info message
                        /// indexes are ordered by attributes in xml
                        var shipToCity = entity[1];
                        var shipToAddress = entity[2];
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity[0] + " Total amount: " + entity[2];
                    }
                    break;
                case "JSON":
                    for (var i in result) {
                        /// Deserialize json object
                        var entity = result[i];
                        var shipToCity = entity.shipto_city;
                        var shipToAddress = entity.shipto_line1;
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity.name + " Total amount: " + entity.totalamount;
                    }
                    break;
                default: //DynamicEntities
                    for (var i in result) {
                        /// Deserialize json object
                        var entity = result[i];
                        var shipToCity = entity.properties.shipto_city;
                        var shipToAddress = entity.properties.shipto_line1;
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity.primaryName + " Total amount: " + entity.properties.totalamount;
                    }
                    break;
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}
function fetchAppointments(resultFormat, online) {
    var starDate = new Date("January,28 2019 11:00");
    var endDate = new Date("February,30 2019 11:00");
    var entity = new MobileCRM.FetchXml.Entity('appointment');
    // add all attributes to fetch
    entity.addAttributes();
    // get activity attribute to set group by
    var activity = entity.attributes["activityid"];
    activity.groupby = true;
    activity.alias = "activity";
    var mainFIlter2 = new MobileCRM.FetchXml.Filter();
    mainFIlter2.type = "or";
    var cnd2 = new MobileCRM.FetchXml.Condition();
    cnd2.attribute = "address_city1";
    cnd2.operator = "like";
    cnd2.values = ["Boston", "Capecode"];
    mainFIlter2.conditions.push(cnd2);
    // === Create filter for data ===
    var dates = new Array();
    dates.push(starDate, endDate);
    var filter = new MobileCRM.FetchXml.Filter();
    filter.type = "and";
    var betweenCondition = new MobileCRM.FetchXml.Condition();
    betweenCondition.attribute = 'scheduledstart';
    betweenCondition.operator = 'between';
    betweenCondition.values = dates;
    var priorityCondition = new MobileCRM.FetchXml.Condition();
    priorityCondition.operator = "eq";
    priorityCondition.attribute = "prioritycode";
    priorityCondition.value = "1";
    filter.conditions.push(priorityCondition, betweenCondition);
    entity.filter = new MobileCRM.FetchXml.Filter();
    entity.filter.filters.push(filter);
    var fetch = new MobileCRM.FetchXml.Fetch(entity);
    fetch.aggregate = true;
    if (online) {
        fetch.executeOnline(resultFormat, function (res) { }, MobileCRM.bridge.alert, null);
    }
    else
        fetch.executeOffline(resultFormat, function (res) { }, MobileCRM.bridge.alert, null);
}
