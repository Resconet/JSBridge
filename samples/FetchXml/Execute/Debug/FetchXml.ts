/// <reference path="JSBridge.d.ts"/>

function executeFromXml(resultFormat: string) {
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
        "</fetch>";;

    MobileCRM.FetchXml.Fetch.executeFromXML(xmlFetch, (result) => {
        if (result.length < 1) {
            MobileCRM.bridge.alert("Not any order begins with 'Bike' and total amount grater than 1500 was found");
        }
        else {
            let info = "Info [Missing ship - to address]: \n";
            switch (resultFormat) {
                case "Array":
                    for (let i in result) {
                        let entity = result[i];
                        /// Append orders what doesn't have filled 'ship to address' to info message
                        /// indexes are ordered by attributes in xml
                        let shipToCity = entity[1]
                        let shipToAddress = entity[2];
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity[0] + " Total amount: " + entity[2];
                    }
                    break;
                case "JSON":
                    for (let i in result) {
                        let entity = result[i];

                        let shipToCity = entity.shipto_city
                        let shipToAddress = entity.shipto_line1;
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity.name + " Total amount: " + entity.totalamount;
                    }
                    break;
                default: //DynamicEntities
                    for (let i in result) {
                        let entity = result[i] as MobileCRM.DynamicEntity;

                        let shipToCity = entity.properties.shipto_city
                        let shipToAddress = entity.properties.shipto_line1;
                        if (!(shipToAddress && shipToCity))
                            info += "\nName: " + entity.primaryName + " Total amount: " + entity.properties.totalamount;
                    }
                    break;
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}


function fetchAppointments(online: boolean) {

    var starDate = new Date("January,28 2019 11:00");
    var endDate = new Date("February,30 2019 11:00");

    let entity = new MobileCRM.FetchXml.Entity('appointment');
    // add all attributes to fetch
    entity.addAttributes();
    // get activity attribute to set group by
    let activity = entity.attributes["activityid"];
    activity.groupby = true;
    activity.alias = "activity";

    let mainFIlter2 = new MobileCRM.FetchXml.Filter();
    mainFIlter2.type = "or";

    let cnd2 = new MobileCRM.FetchXml.Condition();
    cnd2.attribute = "address_city1";
    cnd2.operator = "like";
    cnd2.values = ["Boston", "Capecode"]

    mainFIlter2.conditions.push(cnd2);

    // === Create filter for data ===
    let dates = new Array();
    dates.push(starDate, endDate);

    let filter = new MobileCRM.FetchXml.Filter();
    filter.type = "and";

    let betweenCondition = new MobileCRM.FetchXml.Condition();
    betweenCondition.attribute = 'scheduledstart';
    betweenCondition.operator = 'between';
    betweenCondition.values = dates;

    let priorityCondition = new MobileCRM.FetchXml.Condition();
    priorityCondition.operator = "eq";
    priorityCondition.attribute = "prioritycode";
    priorityCondition.value = "1";

    filter.conditions.push(priorityCondition, betweenCondition);

    entity.filter = new MobileCRM.FetchXml.Filter();
    entity.filter.filters.push(filter);

    var fetch = new MobileCRM.FetchXml.Fetch(entity);
    fetch.aggregate = true;

    let emptyResultInfo = "Not suitable appointment with address Boston or Cape-Code between January,28 2019 11:00 - February,30 2019 11:00 was found.";

    if (online) {
        fetch.executeOnline("DynamicEntities", (res) => {
            if (res.length < 1) {
                MobileCRM.bridge.alert(emptyResultInfo);
            }
            else {
                var info = "Appointments: ";
                for (var i in res) {
                    info += "\n Name: " + res[i].properties.subject;
                }
                MobileCRM.bridge.alert(info);
            }
        }, MobileCRM.bridge.alert, null);
    }
    else
        fetch.executeOffline("DynamicEntities", (res) => {
            if (res.length < 1) {
                MobileCRM.bridge.alert(emptyResultInfo);
            }
            else {
                var info = "Appointments: ";
                for (var i in res) {
                    info += "\n Name: " + res[i].properties.subject;
                }
                MobileCRM.bridge.alert(info);
            }
        }, MobileCRM.bridge.alert, null);
}