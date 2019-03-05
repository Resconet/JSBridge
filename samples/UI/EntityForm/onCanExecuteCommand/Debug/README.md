## Debug folder

Use this folder and its files in case you want to debug the sample.
Please follow below instructions to run sample properly.

## Installation

Prepare Woodford environment according below instructions to try provided sample code.

1. download Debug folder to your local machine
2. import onCanExecuteCommand.html file to Offline HTML section of your Woodford project <br />[onCanExecuteCommand.html file](https://github.com/Resconet/JSBridge/blob/master/samples/UI/EntityForm/onCanExecuteCommand/onCanExecuteCommand.html)
3. go to opportunity entity form in Woodford
4. tap on 'Add IFrame' command
5. set IFrame name to onCanExecuteCommand_example
6. tap on 'Browse' button and select onCanExecuteCommand.html file
7. uncheck 'Delay Load' option
8. save all changes, publish your project and synchronize the application
9. navigate to your opportunity form in the application
10. change the value of *opportunityratingcode* or *estimatedvalue* fields so it fits the criteria

**To run this example, opportunityratingcode or estimatedvalue field must be placed on entity form.**

> Make sure you have latest JSBridge.js file in your Offline HTML section.
<br />[JSBridge.js file](https://github.com/Resconet/JSBridge/blob/master/src/JSBridge.js)

## Installation for debugging

Use this steps if you want to debug the sample and try your own code changes without need to replace the .html file in Offline HTML section every time you make a change.

1. **follow all the steps mentioned above**
2. open project (.sln file) of Debug folder in Visual Studio
3. download debbuging tools and follow installation instructions [Debugging tools](https://github.com/Resconet/JSBridge/tree/master/tools), [Resco Mobile CRM JSDev Edition](https://github.com/Resconet/JSBridge/tree/master/MobileCRM)
4. to run project in the application, click on 'Tools' in VS and choose 'Run in MobileCRM'
<br />

> 'Run in MobileCRM' button replaces your current Offline HTML files in the application folder (WWW folder).
<br />To get Offline HTML files from your Woodford solution, perform Full Sync in the application or make change in Offline HTML folder, publish project and perform Incremental Sync in the application.
