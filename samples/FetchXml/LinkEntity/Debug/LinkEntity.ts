/// <reference path="JSBridge.d.ts"/>

/** fetch parent account appointment activity using link entities. */
function linkParentAccountAppointments() {
    let accountFetchEntity = new MobileCRM.FetchXml.Entity("account");
    accountFetchEntity.addAttributes(); // use this to add all attributes without explicitly specifying them

    /// Create simple filter for fetched account records
    /// Retrieve only accounts what starts with 'A'
    accountFetchEntity.filter = new MobileCRM.FetchXml.Filter();
    accountFetchEntity.filter.where("name", "like", "A%");

    let appointmentLink = new MobileCRM.FetchXml.LinkEntity("appointment");

   // NOTE: linkType defines the way how entities are linked
   //       'outer' link type means that results will contain all parent records (as specified by the filter) even if the child (linked) record does not exist, so it will contain also accounts for which the linked appointment doesn’t 
   //       'inner' link type means that results will contain only parent records (specified by the filter) for which the linked record exists, so only accounts which have the respective associated appointment, and it also means that if no appointment exists for any account the result set will be empty.

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

    appointmentLink.linktype = "inner";
    /// add appointment link to fetch entity
    accountFetchEntity.linkentities.push(appointmentLink);

    let fetch = new MobileCRM.FetchXml.Fetch(accountFetchEntity);
    fetch.execute("DynamicEntities", (res) => {
        if (res.length < 1) {
            MobileCRM.bridge.alert("Not any account what name starts with 'A' and has appointments was found.");
        }
        else {
            var info = "Info: \n";
            for (let i in res) {
                let result = res[i] as MobileCRM.DynamicEntity;
                /// access Linked appointment property
                info += "Account: " + result.primaryName + "\nAppointment: " + result.properties["linkedAppointment.scheduledstart"] + "\n" + result.properties["linkedAppointment.subject"];
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}

function fetch_M_N_ContactToCompetitor() {
    let contact = new MobileCRM.FetchXml.Entity("competitor");
    contact.addAttribute("competitorid");
    contact.addAttribute("name");
    //contact.addAttributes(); - use this to add all attributes without explicitly specifying them

    let linkEntity = contact.addLink("competitorproduct", "competitorid", "competitorid", "outer");
    linkEntity.addAttribute("productid");

    // Note: this example will fail if compentitorproduct relationship is not enabled in Mobile Project in Woodford
    let fetch = new MobileCRM.FetchXml.Fetch(contact, 1);
    fetch.execute("DynamicEntities", (res) => {
        if (res.length < 1) {
            MobileCRM.bridge.alert("Not any Competitor was found.");
        }
        else {
            let info = "Info: \n";
            for (let i in res) {
                let result = res[i];
                /// Check whether competitor product exists
                info += "Competitor: " + result.primaryName;
                if (result.properties["CL0.productid"]) {
                    /// access Linked competitor product properties
                    info += " [" + result.properties["CL0.productid"].primaryName + "]";
                }
                info += "\n";   // append new line to make results readeable
            }
            MobileCRM.bridge.alert(info);
        }
    }, MobileCRM.bridge.alert, null);
}

