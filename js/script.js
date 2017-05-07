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
  $.each(data, function(index, tapahtuma) {
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    osoite = tapahtuma.contact_info.address;
    info = tapahtuma.contact_info.link;

    console.log(tapahtuma);
    ajankohta = annaTapahtumaAika(tapahtuma);

    if (ajankohta !== null) {
      lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta);
    }
  });
}

// Metodi saa parametrina tapahtuman ja antaa tapahtuman ajankohdan paluuarvona.
function annaTapahtumaAika(tapahtuma) {
  if (tapahtuma.start_datetime === null) {
    if (tapahtuma.times[0] === undefined) {
      return null;
    } else {
      tapahtuma_aika = tapahtuma.times[0].start_datetime;
    }
  } else {
    tapahtuma_aika = tapahtuma.start_datetime;
  }

  nykyinenHetki = new Date();
  nykyHetkiMS = Date.parse(nykyinenHetki);
  console.log(nykyHetkiMS);
  if (nykyHetkiMS < tapahtuma_aika) {
    return tapahtuma_aika;
  } else {
    return null;
  }
}


function lisaaTapahtuma(otsikko, kuva, kuva_alt, kuvaus, paikkakunta, osoite, info, ajankohta) {
  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.children('h2').html(otsikko + ' <small>' + osoite + ', ' + paikkakunta + '</small>');
  tapahtumaElementti.find('.kuvaus').text(kuvaus);
  tapahtumaElementti.find('.kuva').html('<img src="' + kuva + '" alt="' + kuva_alt + '" />');
  tapahtumaElementti.find('.info').html('<a href="' + info + '" target="_blank">' + info + '</a>');
  tapahtumaElementti.find('.ajat ').html('<p>' + ajankohta + '</p>');
  tapahtumaElementti.removeAttr('id');
  $('#tapahtumat').append(tapahtumaElementti);
}
