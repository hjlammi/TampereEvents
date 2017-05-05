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
  var otsikko;
  $.each(data, function(index, tapahtuma) {
    otsikko = tapahtuma.title;
    kuva = tapahtuma.image.src;
    kuva_alt = tapahtuma.image.alt;
    kuvaus = tapahtuma.description;
    paikkakunta = tapahtuma.contact_info.city;
    yhteystiedot = tapahtuma.contact_info.link;
  });

  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.children('h2').html(otsikko + ' <small>' + paikkakunta + '</small>');
  tapahtumaElementti.find('.kuvaus').text(kuvaus);
  tapahtumaElementti.find('.kuva').html('<img src="' + kuva + '" alt="' + kuva_alt + '" />');
  tapahtumaElementti.find('.yhteystiedot').html('<a href="' + yhteystiedot + '" target="_blank">' + yhteystiedot + '</a>');
  tapahtumaElementti.removeAttr('id');
  $('#tapahtumat').append(tapahtumaElementti);
}
