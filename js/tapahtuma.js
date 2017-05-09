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
  console.log(tapahtuma.times);
  $.each(tapahtuma.times, function(index, ajat) {
    var alkuaika = ajat.start_datetime;
    if (nykyHetkiMS < alkuaika) {
      tulevatAjat.push(tapahtuma.times[index]);
      console.log(tulevatAjat);
    }
  });
  return tulevatAjat;
}
