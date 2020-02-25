# JSBridge Source

The repository is used to publish **public** npm package to ... https://registry.npmjs.org/

The homepage of package : https://www.npmjs.com/package/@resconet/jsbridge

The package can be installed using following command **npm i @resconet/jsbridgenpm**@[version of package]

The directory contains:
* javascript **.js** and typescript **.d.ts** source file
* package definition file **package.json**
* readme file **README.md**
* .github/workflows directory with **npmpublish.yml** workflow definition file

# Install package in project

In your project directory use **npm init** to set up a new or existing npm package. If you want to create default package json file then use --yes parameter. For more information please visit https://docs.npmjs.com/cli/init

* install package **npm i @resconet/jsbridge**
## Include npm module in project

* **Javascript file**
You can use require to include npm module from installed package. For example

```javascript
require ("@resconet/jsbridge/src/JSBridge");

function testAlert(){
    MobileCRM.bridge.alert("Test");
}
```

* **Typescript file**
You can use import to include npm module from installed package. For example

```javascript
import "@resconet/jsbridge/src/JSBridge"

function testAlert(){
    MobileCRM.bridge.alert("Test");
}
```

## Versioning

The package.json defines the version of JSBridge. e.g. "version": "12.3.1", it means
* 12.3: Major revision (copies the version of underlying Mobile CRM app)
* 1: Bug fix release

**important** first two numbers mirror the latest version of Mobile CRM native application that supports the features.

### Api changes

To check the api changes made in the source file, please go to https://www.resco.net/javascript-bridge-reference/#ApiChanges

## Publishing

The Package is published to npm registry page by the name **....** in every committed change.

The Bug fix release number is automatically updated.

## Contact
For any questions or any specific circumstances, please contact us on the email mobilecrm@resco.net
