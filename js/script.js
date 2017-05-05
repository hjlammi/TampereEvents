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
    console.log(tapahtuma);
    console.log(kuva);
    kuvaus = tapahtuma.description;
  });

  var tapahtumaElementti = $('#tapahtuma').clone();
  tapahtumaElementti.children('h2').text(otsikko);
  tapahtumaElementti.find('#kuvaus').text(kuvaus);
  tapahtumaElementti.removeAttr('id');
  $('#tapahtumat').append(tapahtumaElementti);
}
