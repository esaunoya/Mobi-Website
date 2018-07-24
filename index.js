// Client ID and API key from the Developer Console
var CLIENT_ID = '842850006337-chnnp39a2vtfqkf88rri8c3bjl494o0l.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCrPRnszMw24DVU1Vs4Nu3T0aMNALwUC1Q';
var CALENDAR_ID = 'uta.mobi@gmail.com';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
var MAX_EVENTS = 0;
/**
 *  On load, called to load the API client library.
 */
function handleClientLoad(amountOfEventsShown) {
	// Number of Events Needed by webpage
	MAX_EVENTS = amountOfEventsShown
	gapi.load('client:auth2', initClient);


}

/**
 *  Initializes the API client library 
 */
function initClient() {
	
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		listUpcomingEvents();
	})
}

/**
 *  Replace the current text in Calandar Card (in index.html) with most current event's
 *  Summary and Date.
 */
function appendCalendarCard(summary, when, where, description) {
	document.getElementById("calandarCardTitle").innerHTML = summary;
	formattedDate = formatDate(when)
	document.getElementById("calandarCardDate").innerHTML = formattedDate;
	if (where != undefined ) {
		document.getElementById("calandarCardLocation").innerHTML = where;
	}
	if (description != undefined ) {
		document.getElementById("calandarCarDescription").innerHTML = description
	}

	showPage()

}

/**
 *  Replace the current text in Calandar List (in Workshop.html) with 5
 * 	or less upcoming events with Summary and Date (and location).
 */
function appendCalendarList(summary, when, where) {
	// Create a list element and a h5 element
	var li = document.createElement("li");
	var h5 = document.createElement("h5");
	
	// Add summary (title of event) to a h5 html element and append it to the list element
	var t = document.createTextNode(`${summary}`);
	h5.appendChild(t);
	li.appendChild(h5);

	//Format date and place inside the list element (and location if applicable)
	formattedDate = formatDate(when);
	var dateAndLocation;
	where == undefined ? dateAndLocation = document.createTextNode(`${formattedDate}`):
	dateAndLocation = document.createTextNode(`${formattedDate} in ${where}`);
  li.appendChild(dateAndLocation);
	// Append list element to ul html element (unordered list) in Workshop.html 

	document.getElementById("calendarList").appendChild(li);
	showPage()

}

/**
 * Formats date and time
 * 
 *  If only a date is recived back from Google Calendar API:
 *    Date Format Given By Google Calandar API yyyy-mm-dd ie 2018-12-20
 *    Formated to monthName dd, yyyy
 * 
 * If date and time is recieve back from Google Calendar API:
 *   Date Format given by google calendar API is 2018-06-15T18:00:00-05:00
 *   Formatted to monthName dd, yyyy tt:tt (am/pm)
 * 
 */
function formatDate(when) {

	const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];
	
	// Splits 2018-06-15T18:00:00-05:00 or 2018-12-20 into an array 
	// of numbers
	var dateArray = when.split(/(?:-|T)+/);
	const year = dateArray[0];
	var month = dateArray[1].replace("0", ''); //Replace the 05:00 with 5:00
	const day = dateArray[2];

	// If only date given return just the date else return time as well
	if (dateArray.length <= 3) {
		return `${ monthNames[month]} ${day}, ${year}`;
	} else {
		var time = dateArray[4].replace("0", '');
		var ampm = "0"
		// if the 24 hour time doesn't contain a 0 as the first element ie 17:00
		// it it pm
		dateArray[3][0] == '0' ? ampm = "am" : ampm = "pm"
		return `${ monthNames[month]} ${day}, ${year} ${time} ${ampm}`
	}

}

/**
 * Print the summary and start datetime/date of the next events. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
	gapi.client.calendar.events.list({
		'calendarId': CALENDAR_ID,
		'timeMin': (new Date()).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': MAX_EVENTS,
		'orderBy': 'startTime'
	}).then(function(response) {
		if(response.status >= 200 && response.status < 400){
			var events = response.result.items;
			
			if (events.length > 0) {
				for (i = 0; i < events.length; i++) {
					var event = events[i];
					var when = event.start.dateTime;
					if (!when) {
						when = event.start.date;
					}
					var where = event.location;
					var description = event.description;
					MAX_EVENTS <= 1 ? appendCalendarCard(event.summary, when, where, description) :
					appendCalendarList(event.summary, when, where)
				
				}
			} else {
				MAX_EVENTS <= 1 ? appendCalendarCard('No upcoming events found.') :
				 appendCalendarList('No upcoming Events')

			}
		}else{
			alert('Error: bad response from Google')
		}
	});
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("content").style.display = "block";
}