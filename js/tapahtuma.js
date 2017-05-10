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
  console.log(events);
  return events.sort(function(a, b) {
    return a.occurrences[0].begins - b.occurrences[0].begins;
  });
}

//Metodi saa parametrina tapahtuman ja antaa tapahtuman ajankohdan paluuarvona.
function annaTapahtumaAika(tapahtuma, i) {
  tapahtuma_aika = tapahtuma.times[i].start_datetime;

  var nykyHetkiMS = Date.parse(new Date());
  // Verrataan nykyhetkeä tapahtuma-aikaan. Jos tapahtuma ei ole vielä mennyt,
  // palautetaan tapahtuman times-olio, jossa on sekä alku- että loppuaika.
  // Jos tapahtuma on jo mennyt, palautetaan null.
  if (nykyHetkiMS < tapahtuma_aika) {
    return tapahtuma.times[i];
  } else {
    return null;
  }
}

// Metodi saa parametrina tapahtuman ja lisää tapahtuman tulevat ajat taulukkoon,
// jonka antaa paluuarvona.
function annaVainTulevatAjat(tapahtuma) {
  var nykyHetkiMS = Date.parse(new Date());
  var tulevatAjat = [];
  $.each(tapahtuma.times, function(index, ajat) {
    var alkuaika = ajat.start_datetime;
    if (nykyHetkiMS < alkuaika) {
      tulevatAjat.push(tapahtuma.times[index]);
    }
  });
  return tulevatAjat;
}

// Metodi saa parametrina tapahtuman ja antaa paluuarvona tapahtuman alku ja loppuajan,
// jos aika on vielä tulevaisuudessa.
function annaAlkuJaLoppuaika(tapahtuma) {
  var nykyHetkiMS = Date.parse(new Date());
  var alkuaika = tapahtuma.start_datetime;
  var loppuaika = tapahtuma.end_datetime;
  if (nykyHetkiMS < alkuaika) {
    var alkuJaLoppuaika = {
      start_datetime: alkuaika,
      end_datetime: loppuaika
    };
    return alkuJaLoppuaika;
  } else {
    return null;
  }
}

// Metodi saa parametrina tapahtuman ajat taulukossa ja palauttaa taulukossa
// maksimissaan kolme ensimmäistä tapahtumaa.
function annaMaxKolmeTapahtumaa(tapahtumanAjat) {
  var ajat = [];
  $.each(tapahtumanAjat, function(i){
    ajat.push(tapahtumanAjat[i]);
    return (i < 2);
  });
  return ajat;
}

// Metodi lajittelee tapahtumat aikajärjestykseen alkamispäivämäärän mukaan.
function lajitteleTapahtumat(data) {
  data.sort(function(a, b) {
    if (a.single_datetime && b.single_datetime) {
    return a.start_datetime - b.start_datetime;
  } else if (a.single_datetime && !b.single_datetime) {
    return a.start_datetime - b.times[0].start_datetime;
  } else if (!a.single_datetime && b.single_datetime) {
    return a.times[0].start_datetime - b.start_datetime;
  } else {
    return a.times[0].start_datetime - b.times[0].start_datetime;
  }
  });
  return data;
}
