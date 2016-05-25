# Scripts to Automate F3Nation Comz work

There are two ways to get this working.  The first way is simpler (less tech-savvy) but doesn't allow for automated updates etc.  The second way is more technical, but gives more of a developers workflow to the process.

# Required Configuration
Three config items are required for the BB counts script to work:
1. The URL for the feed.  This is typically the same as your region location landing page with "feed" at the end (e.g. http://f3nation.com/locations/fort-mill-sc/feed/)
2. The fileId for your google sheet.  Create a new Google Sheet and then look at the url.  The fileId is the string between /d and /edit.
3. The sheetName for your google sheet.  This is the actual sheet name in the google sheet, which should have the following columns: Date, Categories, Count, Url

# Mode 1 - Cut and Paste
1. Simply click the green "Clone or download" button at the top of the github page (likely where you are reading this) and choose download Zip.
2. Go to script.google.com and create a new project (I named mine f3-automation)
3. Copy the code from the download in cfg/config.js to the editor window.
4. Copy the code from the download in src/backblasts.js to the editor window (same file as step 3 is fine)
5. Edit the settings from the config.js copy to have the right values (see above) and save the script file.
6. Click the Dropdown at the top of the page to choose the function to run (checkBackblasts).
7. Review and Accept Permissions.
8. Verify the rows are written in the Google Sheet.
9. Click Resources -> Current Project's Triggers, select trigger to run checkBackblasts on whatever period you desire (i did 4 hours).


# Mode 2 - Developer Workflow
To create a working project, there are a few steps that must be completed.

## Pre-requisites
1. NodeJs installed with npm
2. `npm install -g node-google-apps-script`
3. `npm install -g gulp`

## Setup

### Creation of a Project and Credentials in Google Apps Scripts
Go to script.google.com and create a new project (I named mine f3-automation).  Click Resources -> Developers Console Project.  On this new window, click the blue link for your project (e.g. f3-automation - project-id-abc123xyz456).  In the Google API window that opens, click Credentials.  Click Create Credentials and choose OAuth Client ID.  For application type, choose other and give it a name.  Click the download link to download a json file for your new project.  

### Initialize local project
Back in the main script.google.com page for your project, get the project id from the url. It is the value between the /d and /edit (again, we use project-id-abc123xyz456 as an example here).  In this project folder, run the following command:

`gapps init project-id-abc123xyz456`

This will create a gapps.config.json file with the configuration needed.  

### Configuration and Deployment
All configuration is isolated in the cfg folder in the config.js (see the Required Configuration section above).  If you want out of the box behavior, this is all your have to touch.  If you want to customize things beyond the config values, you can edit the source in the src folder.  All source should be in the src folder and will by synchronized to the script.google.com site by running:

`gulp upload`

### Configuring a trigger
In script.google.com, go Resources -> Current Project's Triggers.  Choose the proper trigger (e.g. checkBackblasts) and a schedule (E.g. hourly at every 4 hours).  I also like to set a notification in case of errors here.

### More reading:
[See here](https://www.npmjs.com/package/node-google-apps-script) for the npm documentation on this gapps workflow and [here](https://developers.googleblog.com/2015/12/advanced-development-process-with-apps.html?m=1) for an article on best practices.
