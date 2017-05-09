//Metodi saa parametrina tapahtuman ja antaa tapahtuman ajankohdan paluuarvona.
function annaTapahtumaAika(tapahtuma, i) {
  tapahtuma_aika = tapahtuma.times[i].start_datetime;

  var nykyinenHetki = new Date();
  var nykyHetkiMS = Date.parse(nykyinenHetki);
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
