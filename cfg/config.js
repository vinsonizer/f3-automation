/*
 * The config object is a global configuration object.  Anyone who adopts this
 * script should only have to change these values to get this working
 * for their region.  Each section is for a seperate module, so you should
 * only have to configure what you use.
 */
function getConfiguration() {
    /* Backblast Counts Automation
     *
     * url: Feed by region, if you go to your schedules landing page you find it
     *
     * fileId: File Id for Google sheet.  Open Sheet in browser and copy
     * string after the d/ up to /edit
     *
     * sheetName: Name of the sheet inside the google sheet, assumes Columns are:
     *  Date, Categories, Count, Url
     */
    var backblast_config = {
        url: "http://f3nation.com/locations/fort-mill-sc/feed/",
        fileId: "1B5l_olGDsHI8fL_kzR9h4V5lFrJysB3a6xvU7sct7lk",
        sheetName: "BB Counts"
    };

    /* Trello Curation Configuration
     *
     */
    var trello_config = {
        apiKey: ""
    };
    return {
        backblast_config: backblast_config,
        trello_config: trello_config
    };
}
