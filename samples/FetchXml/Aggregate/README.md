## JSBridge Reference

FetchXML Reference document: [MobileCRM.FetchXml](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml)
<br />Execute method Reference document: [Fetch Execute](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml_Fetch_execute)
<br />FetchXml.Attribute Reference document: [MobileCRM.FetchXml.Attribute](https://www.resco.net/javascript-bridge-reference/#MobileCRM_FetchXml_Attribute)

## FetchXml.Attribute usage

MobileCRM.FetchXml.Attribute object represents FetchXml select statement targeting particular CRM field. It's properties used in this sample are:
>aggregate - string - an aggregation function to execute on fetch (e.g. count, countcolumn, sum, avg, min, max)
<br />alias - string - defines an attribute alias

Recommended usage cases:
- find out information about entity records, such as count, maximum, minimum, average values of specific entity field

## Example explanation

Provided example demonstrates how to check number of orders, maximum and minimum value of 'totalamount' field from existing orders and total amount of all orders.

**1.	aggregateOrders function:**

On button click, following logic is executed:
1. entity used in fetch is specified
2. attribute used in fetch is specified - we want to fetch data of 'totalamount' field from all orders
3. aggregate functions and their aliases are specified in separate variables
4. fetchXml entity is given additional entity attributes from separate variables specifying aggregate functions
5. fetch is executed
6. user is informed about the results of the fetch

## In this repository
    
**Debug repository:**
Includes step by step instructions on how test and debug the sample.
Find more information here: [Readme.md](https://github.com/Resconet/JSBridge/blob/master/samples/FetchXml/Aggregate/Debug/README.md)

**aggregation.html file:**
Open this file to check sample code directly.

## How to run the sample in the application?

[Click for instructions](https://github.com/Resconet/JSBridge/tree/master/samples)

## Versioning

This sample is compatible with version 11.3 or newer.

## References

Here you can find useful references we used in this sample: [References Readme.md](https://github.com/Resconet/JSBridge/blob/master/README.md) 

## Authors

* **Maros Kolibas** - **Resco.net**
* **Lucia Pavlikova** - **Resco.net**
