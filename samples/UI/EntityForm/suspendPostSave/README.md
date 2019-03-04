## JSBridge Reference

EntityForm Reference document: [UI.EntityForm](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm)
<br />suspendPostSave method Reference document: [UI.EntityForm.suspendPostSave](https://www.resco.net/javascript-bridge-reference/#MobileCRM_UI_EntityForm_suspendPostSave)

## suspendPostSave usage

Suspends current “onPostSave” operations and allows performing another asynchronous tasks before the form is closed.

Recommended usage cases:
- perform actions once the form is being saved
- create new records on form save

## Example explanation

Provided example demonstrates how to create new Contact record while new entity (account) record is being saved.

**Function createContactAfterSave:**
1. onPostSave handler is bound
2. current entity record is stored in *entity* variable
3. suspendPostSave method suspends 'onPostSave' operations
4. DynamicEntity object is created for new contact record data - stored in *contact* variable
5. contact attributes are set
6. contact is saved
7. resumePostSave method resumes 'onPostSave' operations

## In this repository
    
**Debug repository:**
Find more information here: [suspendPostSave Debug](https://github.com/Resconet/JSBridge/tree/master/samples/UI/EntityForm/suspendPostSave/Debug)

**suspendPostSave.html file:**
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
