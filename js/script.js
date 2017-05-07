(function() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: "https://visittampere.fi/api/search?type=event&limit=10",
    success: naytaTiedot,
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
}());

function naytaTiedot(data) {
  $.each(data, function(index, tapahtuma) {
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    osoite = tapahtuma.contact_info.address;
    info = tapahtuma.contact_info.link;

    console.log(tapahtuma);
    if (tapahtuma.start_datetime === null) {
      if (tapahtuma.times[0] === undefined) {
      } else {
        tapahtuma_aika = tapahtuma.times[0].start_datetime;
      }
    } else {
      tapahtuma_aika = tapahtuma.start_datetime;
    }

    nykyinenHetki = new Date();
    nykyHetkiMS = Date.parse(nykyinenHetki);
    if (nykyHetkiMS < tapahtuma_aika) {
      ajankohta = tapahtuma_aika;
    } else {
      ajankohta = null;
    }

  });

  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.children('h2').html(otsikko + ' <small>' + osoite + ', ' + paikkakunta + '</small>');
  tapahtumaElementti.find('.kuvaus').text(kuvaus);
  tapahtumaElementti.find('.kuva').html('<img src="' + kuva + '" alt="' + kuva_alt + '" />');
  tapahtumaElementti.find('.info').html('<a href="' + info + '" target="_blank">' + info + '</a>');
  tapahtumaElementti.find('.ajat ').html('<p>' + ajankohta + '</p>');
  tapahtumaElementti.removeAttr('id');
  $('#tapahtumat').append(tapahtumaElementti);
}
