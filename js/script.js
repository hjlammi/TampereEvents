
// Haetaan tiedot.
$('button').on('click', function(){
  var start_datetime = Date.parse(new Date());
  // var end_datetime = Date.parse(new Date()) + 14*24*60*60*1000;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: "https://visittampere.fi/api/search?type=event&limit=10&start_datetime=" + start_datetime /*+ "&end_datetime=" + end_datetime*/,
    success: init,
    headers: {
      "Accept-Language": ''
    },
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
});

$(document).ready(function() {
  // Piirretään kartta ilman markereita.
  initMap();
});

function init(data) {
  var tapahtumat = naytaTiedot(data);
  naytaMarkeritKartalla(map, tapahtumat);
}


function naytaTiedot(data) {
  var otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajat;
  var tapahtumat = [];
  $.each(data, function(index, tapahtuma) {
    ajat = [];
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    osoite = tapahtuma.contact_info.address;
    info = tapahtuma.contact_info.link;

    // Jos tapahtuma on kertaluontoinen, otetaan talteen tapahtuman alku- ja loppuajat.
    if (tapahtuma.single_datetime) {
      ajat.push(annaAlkuJaLoppuaika(tapahtuma));
    // Jos tapahtumalla on useita aikoja.
    } else {
      // Kutsutaan metodia, joka palauttaa taulukossa tapahtuman tulevat ajat.
      var tapahtumanTulevatAjat = annaVainTulevatAjat(tapahtuma);
      // Näytetään tapahtuman ajoista maksimissaan kolme.
      // var naytettavienAikojenLkm = (tapahtumanTulevatAjat.length < 3) ? tapahtumanTulevatAjat.length : 3;
      $.each(tapahtumanTulevatAjat, function(i){
        ajat.push(tapahtumanTulevatAjat[i]);
        return (i < 2);
      });
      /*for (var i = 0; i < naytettavienAikojenLkm; i++) {
        var tapahtuma_aika = annaTapahtumaAika(tapahtuma, i);

        if (tapahtuma_aika !== null) {
        }
      }*/
    }

    if (ajat.length > 0) {
      lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajat);
      tapahtumat.push(tapahtuma);
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
      } /*else {
        alert('Geocode was not successful for the following reason: ' + status);
      }*/
    });
  });
}

// Lisätään tapahtuman tiedot sivulle.
function lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta) {
  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.find('h2').html(otsikko + ' <small>' + ((osoite === null) ? '' : osoite + ', ') +
    ((paikkakunta === null) ? 'Tampere' : paikkakunta) + '</small>');
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
