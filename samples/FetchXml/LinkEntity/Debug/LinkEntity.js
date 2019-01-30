/// <reference path="JSBridge.d.ts"/>
/** fetch parent account appointment activity using link entities. */
function linkParentAccountAppointments() {
    var accountFetchEntity = new MobileCRM.FetchXml.Entity("account");
    accountFetchEntity.addAttributes(); // use this to add all attributes without explicitly specifying them
    /// Create simple filter for fetched account records
    /// Retrieve only accounts what starts with 'A'
    accountFetchEntity.filter = new MobileCRM.FetchXml.Filter();
    accountFetchEntity.filter.where("name", "like", "A%");
    var appointmentLink = new MobileCRM.FetchXml.LinkEntity("appointment");
    // NOTE: Set this to access the properties in result using 'linkAppointment',  e.g. linkAppointment.subject
    //       Otherwise it will be automatically generated as CL0 (or CL1, CL2, ...CLX), where the last number is automatically incremented based on the number of linked entities. 
    appointmentLink.alias = "linkAppointment";

    appointmentLink.alias = "linkedAppointment";
    /// Set all attributes for link entity
    appointmentLink.addAttributes();
    /// Order appointments by scheduled start date
    appointmentLink.orderBy("scheduledstart", true);
    /// Create Relation reference for link and fetch entity (accountFetchEntity)
    appointmentLink.from = "regardingobjectid";
    appointmentLink.to = "accountid";
    // NOTE: linkType defines the way how entities are linked
    //       'outer' link type means that results will contain all parent records (as specified by the filter) even if the child (linked) record does not exist, so it will contain also accounts for which the linked appointment doesn’t 
    //       'inner' link type means that results will contain only parent records (specified by the filter) for which the linked record exists, so only accounts which have the respective associated appointment, and it also means that if no appointment exists for any account the result set will be empty.
      'inner' link will make intersection of link and fetch entity, hence if not any appointment exists for account the result will be empty.
    appointmentLink.linktype = "inner";
    /// add appointment link to fetch entity
    accountFetchEntity.linkentities.push(appointmentLink);
    var fetch = new MobileCRM.FetchXml.Fetch(accountFetchEntity);
    fetch.execute("DynamicEntities", function (res) {
        if (res.length < 1) {
            MobileCRM.bridge.alert("Not any account what name starts with 'A' and has appointments was found.");
        }
        else {
            var info = "Info: \n";
            for (var i in res) {
                var result = res[i];
                /// access Linked appointment property
                info += "Account: " + result.primaryName + "\nAppointment: " + result.properties["linkedAppointment.scheduledstart"] + "\n" + result.properties["linkedAppointment.subject"];
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}
function fetch_M_N_ContactToCompetitor() {
    var contact = new MobileCRM.FetchXml.Entity("competitor");
    contact.addAttribute("competitorid");
    contact.addAttribute("name");
    //contact.addAttributes(); - use this to add all attributes without explicitly specifying them
    var linkEntity = contact.addLink("competitorproduct", "competitorid", "competitorid", "outer");
    linkEntity.addAttribute("productid");
    // Note: this example will fail if compentitorproduct relationship is not enabled in Mobile Project in Woodford
    var fetch = new MobileCRM.FetchXml.Fetch(contact, 1);
    fetch.execute("DynamicEntities", function (res) {
        if (res.length < 1) {
            MobileCRM.bridge.alert("Not any Competitor was found.");
        }
        else {
            var info = "Info: \n";
            for (var i in res) {
                var result = res[i];
                /// Check whether competitor product exists
                info += "Competitor: " + result.primaryName;
                if (result.properties["CL0.productid"]) {
                    /// access Linked competitor product properties
                    info += " [" + result.properties["CL0.productid"].primaryName + "]";
                }
                info += "\n"; // append new line to make results readeable
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}
//# sourceMappingURL=LinkEntity.js.map