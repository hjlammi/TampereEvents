function makeEvent(apiEvent) {
  var occurrences = [];
  if (apiEvent.times !== undefined && apiEvent.times.length > 0) {
    $.each(apiEvent.times, function(i, t){
      var occurrence = {
        begins: t.start_datetime,
        ends: t.end_datetime
      };
      occurrences.push(occurrence);
    });
  } else {
    var occurrence = {
      begins: apiEvent.start_datetime,
      ends: apiEvent.end_datetime
    };
    occurrences.push(occurrence);
  }

  return {
    title: apiEvent.title,
    image: {src: apiEvent.image.src, title: apiEvent.image.title},
    description: apiEvent.description,
    contact_info: {city: apiEvent.contact_info.city, address: apiEvent.contact_info.address, link: apiEvent.contact_info.link},
    occurrences: removePastOccurrences(occurrences)
  };
}

function isOccurrenceInThePast(occurrence) {
  return occurrence.begins < Date.parse(new Date());
}

function removePastOccurrences(occurrences) {
  var futureOccurrences = [];
  $.each(occurrences, function(i, occurrence){
    if (!isOccurrenceInThePast(occurrence)) {
      futureOccurrences.push(occurrence);
    }
  });
  return futureOccurrences;
}

// Metodi palauttaa true, jos event on menneisyydessä.
function isEventInThePast(event){
  return event.occurrences.length === 0;
}

// Metodi tekee rajapinnasta saatavista tapahtumista sellaisen events-listan, josta on
// poistettu menneet tapahtuman ajankohdat ja järjestää jäljelle jääneet tulevaisuuden
// tapahtumat aikajärjestykseen ensimmäisen ajankohdan mukaan, niin että se tapahtuma on
// listalla ensimmäisenä, jonka ensimmäinen ajankohta on lähimpänä nykyhetkestä.
function makeEvents(apiEvents) {
  var events = [];
  $.each(apiEvents, function(i, e) {
    var event = makeEvent(e);
    if (!isEventInThePast(event)) {
      events.push(event);
    }
  });
  return events.sort(function(a, b) {
    return a.occurrences[0].begins - b.occurrences[0].begins;
  });
}
