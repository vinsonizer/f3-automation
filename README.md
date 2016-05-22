# Scripts to Automate F3Nation Comz work

To create a working project, there are a few steps that must be completed.

## Pre-requisites
1. NodeJs installed with npm

## Setup
### Install node-google-apps-script
To run local development and sync with script.google.com, you will need to install a package from npm to manage it with the following command:

`npm install -g node-google-apps-script`

### Creation of a Project and Credentials in Google Apps Scripts
Go to script.google.com and create a new project (I named mine f3-automation).  Click Resources -> Developers Console Project.  On this new window, click the blue link for your project (e.g. f3-automation - project-id-abc123xyz456).  In the Google API window that opens, click Credentials.  Click Create Credentials and choose OAuth Client ID.  For application type, choose other and give it a name.  Click the download link to download a json file for your new project.  

### Initialize local project
Back in the main script.google.com page for your project, get the project id from the url. It is the value between the /d and /edit (again, we use project-id-abc123xyz456 as an example here).  In this project folder, run the following command:

`gapps init project-id-abc123xyz456`

This will create a gapps.config.json file with the configuration needed.  All source should be in the src folder and will by synchronized to the script.google.com site by running:

`gapps upload`

### Configuring a trigger
In script.google.com, go Resources -> Current Project's Triggers.  Choose the proper trigger (e.g. checkBackblasts) and a schedule (E.g. hourly at every 4 hours).  I also like to set a notification in case of errors here.

### More reading:
[See Here](https://www.npmjs.com/package/node-google-apps-script) for the npm documentation on this gapps workflow and [Here](https://developers.googleblog.com/2015/12/advanced-development-process-with-apps.html?m=1) for an article on best practices.
