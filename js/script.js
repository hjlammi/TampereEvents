// Näytetään kymmenen tapahtumaa.
var lkm = 10;

(function() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: "https://visittampere.fi/api/search?type=event&limit=100",
    success: naytaTiedot,
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
}());

function naytaTiedot(data) {
  var otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta;
  console.log(data);
  $.each(data, function(index, tapahtuma) {
    ajankohta = [];
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    osoite = tapahtuma.contact_info.address;
    info = tapahtuma.contact_info.link;

    console.log(tapahtuma);
    if (tapahtuma.start_datetime === null) {
      if (tapahtuma.times.length === 0) {
      } else {
        var naytettavienAikojenLkm = (tapahtuma.times.length < 3) ? tapahtuma.times.length : 3;
        console.log("tapahtuma.times.length: " + tapahtuma.times.length);
        console.log("naytettavienAikojenLkm: " + naytettavienAikojenLkm);
        for (var i = 0; i < naytettavienAikojenLkm; i++) {
          var tapahtuma_aika = annaTapahtumaAika(tapahtuma, i);
          console.log("tapahtuma_aika: " + tapahtuma_aika);

          if (tapahtuma_aika !== null) {
            ajankohta.push(tapahtuma_aika);
          }
        }
      }
    } else {
      var alkuaika = tapahtuma.start_datetime;
      var loppuaika = tapahtuma.end_datetime;
      var ajat = {
        start_datetime: alkuaika,
        end_datetime: loppuaika
      };
      ajankohta.push(ajat);
    }
    console.log("ajankohta:", ajankohta);

    if (ajankohta.length > 0 && lkm > 0) {
      lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta);
      lkm--;
    }
  });
}

//Metodi saa parametrina tapahtuman ja antaa tapahtuman ajankohdan paluuarvona.
function annaTapahtumaAika(tapahtuma, i) {
  tapahtuma_aika = tapahtuma.times[i].start_datetime;

  var nykyinenHetki = new Date();
  var nykyHetkiMS = Date.parse(nykyinenHetki);
  if (nykyHetkiMS < tapahtuma_aika) {
    return tapahtuma.times[i];
  } else {
    return null;
  }
}

// Metodi lisää tapahtuman tiedot sivulle.
function lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta) {
  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.find('h2').html(otsikko + ' <small>' + osoite +
    ((paikkakunta === null) ? '' : ', ' + paikkakunta) + '</small>');
  tapahtumaElementti.find('.kuvaus').text(kuvaus);
  tapahtumaElementti.find('.kuva').html('<img src="' + kuva + '" alt="' + kuva_alt + '" />');
  tapahtumaElementti.find('.info').html('<a href="' + info + '" target="_blank">' + info + '</a>');

  $.each(ajankohta, function(index, ajat) {
    var alkamisaika = moment(ajat.start_datetime).format("D.M.YYYY");
    var alkaaKlo = moment(ajat.start_datetime).format("k.mm");
    var loppumisaika = moment(ajat.end_datetime).format("D.M.YYYY");
    var loppuuKlo = moment(ajat.end_datetime).format("k.mm");

    tapahtumaElementti.find('.ajat ').append('<p>' + alkamisaika + ' at ' + alkaaKlo + ' &ndash; ' + loppumisaika + ' at ' + loppuuKlo + '</p>');
  });

  tapahtumaElementti.removeAttr('id');
  $('#tapahtumat').append(tapahtumaElementti);
}
