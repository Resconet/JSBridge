## JSBridge Reference

FetchXML Reference document: [MobileCRM FetchXml](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml)
<br />Execute method Reference document: [Fetch Execute](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml_Fetch_execute)

## FetchXML usage

The FetchXML query string must conform to the schema definition for the FetchXML language.
Execution of query returns the appropriate results.

Recommended usage cases:
- get entity data matching specified attributes
- get array of MobileCRM.DynamicEntity objects as a result of success callback

> To avoid negative effect on performance, dont retrieve all entity attributes in query.

## Example explanation

Provided example demonstrates how to execute fetch using XML format or MobileCRM.FetchXml.Fetch object.

**1.	Function executeFromXML:**
	<br />XML formatted fetch constructed query is executed for Order entity and contains attributes such as 'Name, City, Adress, TotalAmount'.
	Given output meets the conditions stated in filter - Name starts with 'Bike' and 'TotalAmount' is greater than 1500.
	Output is serialized by specified result format.

**2.	Function fetchAppointments:**
	<br />The same logic as in the first function is implemented using MobileCRM.FetchXml.Fetch object.

## In this repository
    
**Debug repository:**
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/FetchXml/Execute/Debug/README.md)

**execute.html file:**
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
