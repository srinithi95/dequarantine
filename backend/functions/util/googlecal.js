const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

exports.authorize = ( clientCredentials ) => {
    const { client_secret, client_id, redirect_uris } = clientCredentials;
    const redirect_uri = JSON.parse(redirect_uris)[0];
    const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

    let url = OAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    return url;
}

 
exports.addToCalendar= (eventData, credentials) => {
    const {refresh_token, client_id, client_secret, redirect_uris} = credentials;

    const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const calendar = google.calendar({version: 'v3', auth: OAuth2Client});
    OAuth2Client.setCredentials({refresh_token: credentials.refresh_token});
    calendar.events.insert({
        OAuth2Client,
        calendarId: 'primary',
        resource: {
            summary: eventData.name,
            description: eventData.description,
            start: {
                dateTime: "2020-04-30T10:30:00.0z"
            },
            end: {
                dateTime: "2020-05-01T10:30:00.0z"
            }
        }
    })
    .then(result => {
        console.log('RESULT', result);
        return "Successful";
    })
    .catch(err => {
        console.log("ERROR\n-----------------\n", err);
        return "Error adding event to calendar";
    });
}