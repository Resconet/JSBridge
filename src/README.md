# JSBridge

JSBridge - Javascript API for Resco Mobile CRM

Getting started with working and debugging of an offline HTML solution.  
https://www.resco.net/debugging-offline-html-solution/

## Introduction

Resco Mobile CRM application functionality can be extended using HTML + Javascript code.
Your html file containing custom code can be executed both online and offline.
Offline html files are part of Woodford customization project.

Watch webinars for intro to OfflineHTML in Resco MobileCRM.
<br />[Webinar Offline HTML in Resco Mobile CRM - Part 1/2 (Intro)](https://www.youtube.com/watch?v=cplZLC_mAc0&list=PLPMCnAPD5b56XNEiGTcy5VBxdP8rcB86b&index=12)  
[Webinar Offline HTML in Resco Mobile CRM - Part 2/2 (Data Access)](https://www.youtube.com/watch?v=R7GpdC_y17Y&t=1s)

Release contains the debugging/development build(s) of the Resco Mobile CRM application.  
Per platform application packages are available.

## IFrame

You can put a web browser, known as IFrame, in various components in the app.
IFrames can be used within EntityForm, EntityList or within HomeForm.
IFrame points to your custom html code file.

## Documentation

Description of the methods and objects defined in Resco JavaScript Bridge.  
[Latest Reference](https://www.resco.net/javascript-bridge-reference/)  
[Guide](http://www.resco.net/mobilecrm/support/jsbridge.aspx)

## Installing the package

In your project directory use **npm init** to set up a new or existing npm package. If you want to create default package json file then use --yes parameter. For more information please visit https://docs.npmjs.com/cli/init

- install package **npm i @resconet/jsbridge**

## Using the library

- **Javascript file**
  You can use require to include the module from installed packages. For example

```javascript
require("@resconet/jsbridge");

function testAlert() {
  MobileCRM.bridge.alert("Test");
}
```

- **Typescript file**
  You can use import to include the module from installed packages. For example

```javascript
import "@resconet/jsbridge";

function testAlert() {
  MobileCRM.bridge.alert("Test");
}
```

## Versioning

The package.json defines the version of JSBridge. e.g. "version": "12.3.1", it means

- 12.3: Major revision (copies the version of underlying Mobile CRM app)
- 1: Bug fix release

**important** first two numbers mirror the latest version of Mobile CRM native application that supports the features.

### Api changes

To check the api changes made in the source file, please go to https://www.resco.net/javascript-bridge-reference/#ApiChanges

## Publishing

The Package is published to npm registry page on release publish event.

The Bug fix release number is automatically updated when new js or ts file is pushed.

## Contact

For any questions or any specific circumstances, please contact us on the email mobilecrm@resco.net
