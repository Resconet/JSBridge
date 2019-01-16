/// <reference path="JSBridge.d.ts"/>

function createAccount() {
    let account = new MobileCRM.DynamicEntity("account");
    /// set account properties
    account.properties.name = "#New Test account";
    account.properties.emailaddress1 = "example@example.com";
    account.properties.fax = 555 - 456 - 789;
    /// set address fields
    account.properties.address1_city = "77 Massachusetts Ave";
    account.properties.address1_stateprovince = "MA";
    account.properties.address1_postalcode = "02139";
    account.properties.address1_country = "US";

    account.saveAsync().then((entity) => {
        updateAccount(entity.entityName, entity.id, true);
    }, MobileCRM.bridge.alert("Failed to create account"));
}

function updateAccount(entityName: string, id: string, useFetch: boolean) {
    // to access data of dynamic entity you can use 'fetchXML' or 'loadById method'
    if (useFetch) {
        let fetchEntity = new MobileCRM.FetchXml.Entity(entityName);
        /// add all attributes to fetch xml
        fetchEntity.addAttributes();

        fetchEntity.filter = new MobileCRM.FetchXml.Filter();
        fetchEntity.filter.where("accountid", "eq", id);

        let fetch = new MobileCRM.FetchXml.Fetch(fetchEntity);
        fetch.execute("DynamicEntities", (res) => {
            if (res.length > 0) {
                let entity = res[0] as MobileCRM.DynamicEntity;
                entity.properties.emailaddress1 = "new_email@example.com";
                // save entity changes
                entity.save((err) => {
                    if (err) MobileCRM.bridge.alert("Failed to update email address.\nErr: " + err);
                    else {
                        /* Continue in code execution */
                        MobileCRM.bridge.alert("Email address updated successfully");
                    }
                });
            }
            else
                MobileCRM.bridge.alert("Not suitable record found!");

        }, (err) => { MobileCRM.bridge.alert("Failed to fetch account with specific id.\nErr: " + err); }, null);
    }
    else {
        MobileCRM.DynamicEntity.loadById(entityName, id, (entity) => {
            entity.properties.emailaddress1 = "new_email@example.com";
            // save entity changes
            entity.save((err) => {
                if (err) MobileCRM.bridge.alert("Failed to update email address.\nErr: " + err);
                else {
                    /* Continue in code execution */
                    MobileCRM.bridge.alert("Email address updated successfully");
                }
            });
        });
    }
}
