// Näytetään kymmenen tapahtumaa.
var lkm = 10;

// Haetaan tiedot.
$('button').on('click', function(){
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: "https://visittampere.fi/api/search?type=event&limit=100",
    success: init,
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
});

// Piirretään kartta ilman markereita.
$(document).ready(function() {
  initMap();
});

function init(data) {
  var tapahtumat = naytaTiedot(data);

  naytaMarkeritKartalla(map, tapahtumat);
}


function naytaTiedot(data) {
  var otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta;
  var tapahtumat = [];
  $.each(data, function(index, tapahtuma) {
    ajankohta = [];
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    osoite = tapahtuma.contact_info.address;
    info = tapahtuma.contact_info.link;

    if (tapahtuma.start_datetime === null) {
      if (tapahtuma.times.length === 0) {
      } else {
        // Näytetään tapahtuman ajoista maksimissaan kolme.
        var naytettavienAikojenLkm = (tapahtuma.times.length < 3) ? tapahtuma.times.length : 3;
        for (var i = 0; i < naytettavienAikojenLkm; i++) {
          var tapahtuma_aika = annaTapahtumaAika(tapahtuma, i);

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

    if (ajankohta.length > 0 && lkm > 0) {
      lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta);
      tapahtumat.push(tapahtuma);
      lkm--;
    }

  });
  return tapahtumat;
}

/*
 * Apumetodit.
 */

// Näytetään kartta.
function initMap() {
  var tampere = {lat: 61.507756, lng: 23.760240};
  map = new google.maps.Map(document.getElementById('map'), {
          zoom: 9,
          center: tampere
        });
}

function naytaMarkeritKartalla(map, tapahtumat) {
  geocoder = new google.maps.Geocoder();
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var markers = [];
  var i = 0;
  var markerclusterer = new MarkerClusterer(map, [],
    {imagePath: 'images/m'});
  $.each(tapahtumat, function(index, tapahtuma){
    var address = tapahtuma.contact_info.address + ', Tampere';
    var otsikko = tapahtuma.title;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        var lat = results[0].geometry.location.lat();
        var lng = results[0].geometry.location.lng() + 0.00004 * i;
        markerclusterer.addMarker(new google.maps.Marker({
          position: {lat: lat, lng: lng},
          title: otsikko + ', ' + address,
        }));
        i++;
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
}

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
