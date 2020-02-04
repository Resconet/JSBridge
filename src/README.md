# JSBridge Source

The repository is used to publish **public** npm package to ... https://registry.npmjs.org/

The homepage of package : https://www.npmjs.com/package/@resconet/jsbridgenpm

The package can be installed using following command **npm i @resconet/jsbridgenpm**@[version of package]

The directory contians:
* javascript **.js** and typescript **.d.ts** source file
* package definition file **package.json**
* readme file **README.md**
* .github/workflows directory with **npmpublish.yml** workflow definition file

## Versioning

The package.json defeines the version of JSBridge. e.g. "version": "12.3.1" , it means
* 12.3: Major revision (copies the version of underlying Mobile CRM app)
* 1: Bug fix release

**important** first two numbers mirros the latest version of Mobile CRM native application what supports the features.

### Api changes

To check the api changes made in the source file, please go to https://www.resco.net/javascript-bridge-reference/#ApiChanges

## Publishing

The Package is published to npm registiry page by the name **....** in every committed change.

The Bug fix release number is automatically updated.

## Contact
For any questions or any specific circumstances, please contact us on the email mobilecrm@resco.net
