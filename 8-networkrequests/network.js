'use strict';

// THere are actually 3 network requests for each user
// that we present in the browser
// using .shareReplay allows us to have a single network request 
// shared by all subscribers
var refreshButton = document.querySelector('.refresh');

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

var requestOnRefreshStream = refreshClickStream
  .map(ev => {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var responseStream = startupRequestStream.merge(requestOnRefreshStream)
  .flatMap(requestUrl => {
    console.log('do network request');
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  })
  .shareReplay(1);

function createSuggestionStream(responseStream) {
  return responseStream.map(listUsers =>
    listUsers[Math.floor(Math.random()*listUsers.length)]
  )
  .startWith(null)
  .merge(refreshClickStream.map(ev => null));
}

var suggestion1Stream = createSuggestionStream(responseStream);
var suggestion2Stream = createSuggestionStream(responseStream);
var suggestion3Stream = createSuggestionStream(responseStream);

// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser, selector) {
  var suggestionEl = document.querySelector(selector);
  if (suggestedUser === null) {
    suggestionEl.style.visibility = 'hidden';
  } else {
    suggestionEl.style.visibility = 'visible';
    var usernameEl = suggestionEl.querySelector('.username');
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;
    var imgEl = suggestionEl.querySelector('img');
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
}

suggestion1Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion3');
});
