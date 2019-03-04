## JSBridge Reference

FetchXML Reference document: [MobileCRM FetchXml](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml)
<br />LinkEntity method Reference document: [Link Entity](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml_LinkEntity)
<br />addLink method Reference document: [Add Link](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml_Entity_addLink)

## FetchXml.LinkEntity usage

Method represents a FetchXml query linked entity. Execution of query returns the appropriate results.
It's properties are:
>alias - string - link alias
<br />from - string - the “from” field (if parent then target entity primary key)
<br />linkType - string - the link (join) type -> inner or outer
<br />to - string - the "to" field

Recommended usage cases:
- get entity data linked to specified entity & matching specified attributes
- get array of MobileCRM.DynamicEntity objects as a result of success callback

## Example explanation

Provided example demonstrates how to execute fetch using FetchXml.Entity and FetchXml.LinkEntity to get records linked to a particular entity.

1. The goal is to show all Accounts starting with 'A' and their linked Appointments.
2. The goal is to show all the Competitors with their linked Competitors Products.

**1.	Function linkParentAccountAppointments:**
	<br />Fetch query is executed for Account entity records. These records are filtered to only keep accounts starting with "A". Link for Appointment entity is created - *appointmentLink*. Properties are set and we want the result records to be ordered by scheduled start date. Configured link is added to entity fetch. Result of the fetch is shown in alert. 

**2.	Function fetch_M_N_CompetitorToCompetitorProduct:**
	<br />Fetch query is executed for Competitor entity records. Link for Competitor Product entity is directly added to existing fetch via **addLink** method. Result of the fetch is shown in alert. 

  >Returned object is derived from FetchXml.Entity.

## In this repository
    
**Debug repository:**
Find more information here: [LinkEntity Debug](https://github.com/Resconet/JSBridge/tree/master/samples/FetchXml/LinkEntity/Debug)

**linkEntity.html file:**
Open this file to check sample code directly.

## How to run the sample in the application?

[Click for Instructions](https://github.com/Resconet/JSBridge/tree/master/samples)

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references we used in this sample: [References Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) 

## Authors

* **Maros Kolibas** - **Resco.net**
* **Lucia Pavlikova** - **Resco.net**
