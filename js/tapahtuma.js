// Muodostetaan oma tapahtumaolio, johon otetaan vain tarvittavat tiedot ja tehdään
// korvaava taulukko tapahtuman ajoille eli occurrenceseille.
function makeEvent(apiEvent, beginsAt) {
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
    event_id: apiEvent.item_id,
    title: apiEvent.title,
    image: (apiEvent.image === undefined) ? { src: "", title: ""} : {src:  apiEvent.image.src, title: apiEvent.image.title},
    description: apiEvent.description,
    contact_info: {city: apiEvent.contact_info.city, address: apiEvent.contact_info.address, link: apiEvent.contact_info.link},
    occurrences: removeOccurrencesThatNotInRange(occurrences, beginsAt)
  };
}

// Metodi tutkii onko tapahtuman ajankohta annetun aikaikkunan sisällä.
function isOccurrenceInRange(occurrence, beginsAt) {
  // Jos tapahtuman päättymisaika on myöhemmin kuin alkamisaika, ajankohta on aikaikkunan sisällä.
  return occurrence.ends >= beginsAt;
}

// Poistetaan tapahtumat, jotka eivät ole annetun aikaikkunan sisällä.
function removeOccurrencesThatNotInRange(occurrences, beginsAt) {
  var occurrencesInRange = [];
  $.each(occurrences, function(i, occurrence){
    if (isOccurrenceInRange(occurrence, beginsAt)) {
      occurrencesInRange.push(occurrence);
    }
  });
  return occurrencesInRange;
}

// Metodi palauttaa true, jos event on menneisyydessä.
function isEventInThePast(event){
  return event.occurrences.length === 0;
}

// Metodi tekee rajapinnasta saatavista tapahtumista sellaisen events-listan, josta on
// poistettu menneet tapahtuman ajankohdat ja järjestää jäljelle jääneet tulevaisuuden
// tapahtumat aikajärjestykseen ensimmäisen ajankohdan mukaan, niin että se tapahtuma on
// listalla ensimmäisenä, jonka ensimmäinen ajankohta on lähimpänä nykyhetkestä.
function makeEvents(apiEvents, beginsAt, lastBeginsAt) {
  var events = [];
  $.each(apiEvents, function(i, e) {
    var event = makeEvent(e, beginsAt);
    if (!isEventInThePast(event)) {
      if (event.occurrences[0].begins <= lastBeginsAt) {
        events.push(event);
      }
    }
  });
  return events.sort(function(a, b) {
    return a.occurrences[0].begins - b.occurrences[0].begins;
  });
}
