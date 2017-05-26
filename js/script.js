// Globaali muuttuja tapahtumille.
var events;

$(document).ready(function() {
  var today = moment().format();
  var todayAsDate = moment().format('D.M.YYYY');
  // Luodaan kalenteriolio.
  $('#datepicker1').daterangepicker({
    locale: {
      format: "D.M.YYYY",
      daysOfWeek: [
       'Su',
        'Ma',
        'Ti',
        'Ke',
        'To',
        'Pe',
        'La',
        ],
      monthNames: [
        'Tammikuu',
        'Helmikuu',
        'Maaliskuu',
        'Huhtikuu',
        'Toukokuu',
        'Kesäkuu',
        'Heinäkuu',
        'Elokuu',
        'Syyskuu',
        'Lokakuu',
        'Marraskuu',
        'Joulukuu',
        ],
      firstDay: 1
    },
    startDate: todayAsDate,
    showDropdowns: true,
    minDate: todayAsDate,
    opens: 'right',
    autoApply: true
  });

  // Pudotusvalikon tekstin päivittäminen.
  $('.dropdown-toggle').dropdown();
  $('.dropdown-menu li a').click(function(){
    // Näytetään dropdown-menun valintana klikattu teksti.
    $('#dropdownMenu1').text($(this).text() + ' ');
    $('#dropdownMenu1').append('<span class="caret"></span>');
  });

  // Päivitetään tapahtumasivu klikkaamalla "Hae tapahtumia" -nappia.
  $('#submit').on('click', function(){
    // Päivitetään tapahtumasivu.
    updateEventPage();
    // Skrollataan sivulle kohtaan tapahtumat.
    $.scrollTo('#tapahtumat', 1000);
  });

  // Päivitetään tapahtumasivu enterillä.
  $('body').on('keypress', function(e) {
    if (e.keyCode === 13) {
      updateEventPage();
      $.scrollTo('#tapahtumat', 1000);
    }
  });

  // Tyhjennetään hakukentät.
  $('#clear').on('click', function(){
    $('#dropdownMenu1').text('Kategoria ');
    $('#dropdownMenu1').append('<span class="caret"></span>');
    $('#search').val('');
    var picker = $('#datepicker1').data('daterangepicker');
    picker.setStartDate(moment().format('D.M.YYYY'));
    picker.setEndDate(moment().format('D.M.YYYY'));
    $('#free').prop('checked', false);
  });

  // Lisätään tapahtuma suosikiksi.
  $('.tapahtuma button:first').on('click', function() {
    // Tyhjennetään tapahtumasivu, jottei sama tapahtuma näy useampaan kertaan.
    $('.fav-event:not(#fav-event)').remove();
    // Haetaan suosikkitapahtumat localStoragesta.
    var favorites = getFavorites();
    // Klikatun tapahtuman id.
    var thisEventId = parseInt($(this).parents('.tapahtuma').attr('data-event_id'));
    $(this).toggleClass('favored');
    // Jos tapahtuma on jo merkitty suosikiksi, päivitetään napin teksti ja ikoni ja
    // lisätään tapahtuman id suosikkeihin. Muussa tapauksessa nappiin päivitetään
    // teksti "Lisää suosikiksi" ja poistetaan tapahtuma suosikeista.
    if ($(this).hasClass('favored')) {
      $(this).html('<span class="glyphicon glyphicon-heart"></span> Suosikki');
      favorites.push(thisEventId);
    } else {
      $(this).text('Lisää suosikiksi');
      _.remove(favorites, function(id) {
        return id === thisEventId;
      });
    }
    // Lisätään suosikit localStorageen.
    setFavorites(favorites);
    // Lisätään suosikit suosikkisivulle.
    addFavoritesOnPage(getFavorites());
  });

  // Suosikin poistaminen suosikeista suosikkilistan poistonapilla.
  $('.fav-event button').on('click', function() {
    var thisEventId = parseInt($(this).parents('.fav-event').attr('data-event_id'));

    // Varmistetaan käyttäjältä, että tämä haluaa poistaa tapahtuman suosikeista.
    bootbox.confirm('Haluatko varmasti poistaa tapahtuman suosikeista?', function(confirmed) {
      // Jos käyttäjä klikkasi ok:ta, tyhjennetään suosikkisivu tapahtumista, haetaan
      // localStoragesta tieto suosikkitapahtumista ja poistetaan klikattu tapahtuma suosikeista.
      if (confirmed) {
        $('.fav-event:not(#fav-event)').remove();
        var favorites = getFavorites();
        _.remove(favorites, function(id) {
          return id === thisEventId;
        });
        // Tallennetaan tieto suosikeista localStorageen ja lisätään suosikit suosikkisivulle.
        setFavorites(favorites);
        addFavoritesOnPage(favorites);
        $(this).parents('.fav-event').remove();
        // Haetaan tapahtumasivulta suosikiksi lisäämisnappi ja poistetaan siltä favored-luokka
        // sekä päivitetään napin teksti.
        var favButton = $('div.tapahtuma[data-event_id=' + thisEventId + '] button.favorite');
        favButton.removeClass('favored').text('Lisää suosikiksi');
      }
    });
  });

  // Navigointi tabien välillä.
  $('nav a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  // Näytetään yksittäinen markeri kartalla.
  $('.tapahtuma button.on-map').on('click', function() {
    $('#route-panel').empty();
    $(this).toggleClass('show-map');
    // Jos napilla on luokka show-map eli sitä on painettu, piirretään kartta uudelleen
    // ja lisätään sille nappia vastaavan tapahtuman markeri.
    if ($(this).hasClass('show-map')) {
      initMap();
      // Poistetaan muilta napeilta luokka, joka tarkoittaa, että nappi on "päällä".
      $('.tapahtuma button.on-map').not(this).removeClass('show-map');
      var thisEventId = parseInt($(this).parents('.tapahtuma').attr('data-event_id'));
      $.each(events, function(i, event) {
        if (event.event_id === thisEventId) {
          var geocoder = new google.maps.Geocoder();
          var address = event.contact_info.address + ', ' + event.contact_info.city;
          var title = event.title;
          geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == 'OK') {
              map.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                  map: map,
                  position: results[0].geometry.location,
                  title: title + ', ' + address
              });
              map.setZoom(15);
              map.panTo(marker.position);
              var infowindow = new google.maps.InfoWindow({
                content: marker.title
              });
              // Näytetään lisätyn markerin infoikkuna oletuksena.
              infowindow.open(map, marker);
            }
          });
        }
      });
    // Jos "näyta kartalla" -nappi painetaan pois päältä, piirretään kartta uudelleen ja
    // näytetään kartalla max. 10 tapahtumaa.
    } else {
      initMap();
      showEventsOnMap(map, events);
    }
    // Skrollataan karttaan.
    $.scrollTo('#map-container', 1000);
  });

  // Näytetään reitti ja reittiohjeet kartalla, kun klikataan "näytä kartalla" -nappia.
  $('.tapahtuma button.directions').on('click', function() {
    $('#route-panel').empty();
    var thisEventId = parseInt($(this).parents('.tapahtuma').attr('data-event_id'));
    // Pyydetään käyttäjältä lähtöpaikan osoitetieto.
    var startPlace = prompt('Kirjoita lähtöpaikka:');
    if (startPlace !== null) {
      initMap();
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);
      directionsDisplay.setPanel($('#route-panel').get(0));

      $.each(events, function(i, event) {
        if (event.event_id === thisEventId) {
          // Haetaan id:tä vastaavan tapahtuman osoite. Jos kaupunkitieto puuttuu, oletetaan että kyseessä
          // on Tampere.
          var address = ((event.contact_info.address === null) ? '' : event.contact_info.address + ' ') +
            ((event.contact_info.city === null) ? 'Tampere' : event.contact_info.city);
          var title = event.title;

          directionsService.route({
              // Lähtöpaikka.
              origin: startPlace,
              // Päämäärä.
              destination: address,
              travelMode: 'DRIVING'
            }, function(response, status) {
              if (status === 'OK') {
                directionsDisplay.setDirections(response);
              } else {
                // Jos osoite oli virheellinen näytetään virheilmoitus.
                bootbox.alert('Osoitetta ei löytynyt. Yritä uudelleen.');
                initMap();
                showEventsOnMap(map, events);
              }
          });
          $.scrollTo('#map-container', 1000);
        }
      });
    }
  });

  // Sivun ladattua haetaan tapahtumatiedot.
  getData(getSearchParameters());
  // Piirretään kartta ilman markereita, kun sivu on valmis.
  initMap();
  // Lisätään suosikit suosikkisivulle.
  addFavoritesOnPage(getFavorites());
});

// Haetaan tapahtumatiedot rajapinnasta.
function getData(searchParameters) {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    data: searchParameters,
    url: "https://visittampere.fi/api/search",
    success: function(response){
      showResultsOnPage(response, searchParameters.start_datetime);
    },
    headers: {
      "Accept-Language": ''
    },
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
}

// Metodi selvittää käyttäjänantamat hakuparametrit, jotka antaa paluuarvona.
function getSearchParameters() {
  // Haetaan aina pelkkiä tapahtumia (event) ja asetetaan limitiksi 100, jotta saadaan
  // kaikki tapahtumat eikä vain kymmentä satunnaista.
  var searchParameters = {type: 'event', limit: 100};

  // Suodatetaan kategorian perusteella, jos kategoriaksi on valittu muu kuin "Kategoria" tai "Kaikki".
  var category = $.trim($('#dropdownMenu1').text());
  if (category !== 'Kategoria' || category !== 'Kaikki') {
    if (category === 'Musiikki') {
      searchParameters.tag = 'music';
    } else if (category === 'Lapsille') {
      searchParameters.tag = 'for-children';
    } else if (category === 'Taide') {
      searchParameters.tag = 'visual-art';
    } else if (category === 'Tanssi') {
      searchParameters.tag = 'dance';
    } else if (category === 'Urheilu') {
      searchParameters.tag = 'sports';
    } else if (category === 'Festivaali') {
      searchParameters.tag = 'festival';
    } else if (category == 'Teatteri') {
      searchParameters.tag = 'theatre';
    }
  }

  // Suodatetaan hakukentässä olevan tekstin perusteella.
  if ($('#search').val() !== '') {
    searchParameters.text = $('#search').val();
  }

  // Näytetään maksuttomat tapahtumat, jos checkbox on valittu.
  if ($('#free').is(':checked')) {
    searchParameters.free = true;
  }

  // Haun alkupäiväksi valitaan kalenteriolion alkupäivä, joka on sivun latauduttua
  // tämä päivä.
  var picker1 = $('#datepicker1').data('daterangepicker');
  searchParameters.start_datetime = picker1.startDate.valueOf();

  return searchParameters;
}


// Metodi saa parametreina rajapinnasta tulleet tapahtumatiedot sekä tapahtumahaun alkuajan.
// Piirretään tyhjä kartta, lisätään tapahtumat sivulle ja piirretään tapahtumat kartalle.
function showResultsOnPage(apiData, start_datetime) {
  initMap();
  // Tallennetaan tieto näytetyistä tapahtumista globaaliin events-muuttujaan.
  events = showEventsOnPage(apiData, start_datetime);
  showEventsOnMap(map, events);
}

// Metodi saa parametreina rajapinnasta tulleet tapahtumatiedot sekä tapahtumahaun alkuajan.
function showEventsOnPage(apiData, searchBeginDate) {
  var picker = $('#datepicker1').data('daterangepicker');
  var searchEndDate = moment(picker.endDate).endOf('day').valueOf();
  // Karsitaan rajapinnasta tulevista tapahtumista pois sellaiset tapahtumat, jotka eivät
  // sisälly haun alkamis- ja loppumispäivän väliseen haarukkaan.
  var events = makeEvents(apiData, searchBeginDate, searchEndDate);
  addEventsOnPage(events);
  return events;
}

// Metodi saa parametrina tapahtumat, jotka on lisätään sivulle. Jos tapahtumia ei ole yhtään,
// näytetään virheilmoitus. Muuten lisätään tapahtumat yksi kerrallaan sivulle.
function addEventsOnPage(events) {
  if (events.length === 0) {
    errorMessage();
  } else {
    $.each(events, function(i, event) {
      addEventOnPage(event);
    });
  }
}

// Virheilmoitus jos tapahtumia ei ole.
function errorMessage() {
  $('#tapahtuma').after('<div class="row><div class=col-md-12 alert alert-info" role="alert">Hakuehtoja vastaavia tapahtumia ei löytynyt. Yritä uudelleen.</div></div>');
}

// Metodilla päivitetään tapahtumasivu.
function updateEventPage() {
  // Tyhjennetään DOM:sta edellisen hauan antamat tapahtumat ja mahdollinen virheilmoitus.
  $('.tapahtuma:not(#tapahtuma)').remove();
  $('[role="alert"]').remove();
  // Tyhjennetään myös reitin näyttävä paneeli.
  $('#route-panel').empty();
  // Kutsutaan metodia, joka palauttaa hakuun tarvittavat parametrit.
  var searchParameters = getSearchParameters();
  getData(searchParameters);
}

// Lisätään yksittäisen tapahtuman tiedot sivulle.
function addEventOnPage(event) {
  // Kloonataan sivulla oleva tapahtuma-elementti.
  var eventElement = $('#tapahtuma').clone(true);
  eventElement.find('h2').html(event.title + ' <small>' + ((event.contact_info.address === null) ? '' : event.contact_info.address + ', ') +
    ((event.contact_info.city === null) ? 'Tampere' : event.contact_info.city) + '</small>');
  eventElement.find('.kuvaus').text(event.description);
  eventElement.find('.kuva').html('<img src="' + event.image.src + '" alt="' + event.image.title + '" />');
  eventElement.find('.info').html('<a href="' + event.contact_info.link + '" target="_blank">Lisätietoja</a>');

  // Tapahtuman ajoista näytetään vain kolme ensimmäistä.
  $.each(event.occurrences, function(i, o) {
    var begins_date = moment(o.begins).format("D.M.YYYY");
    var begins_time = moment(o.begins).format("H.mm");
    var ends_date = moment(o.ends).format("D.M.YYYY");
    var ends_time = moment(o.ends).format("H.mm");

    eventElement.find('.ajat ').append('<p>' + begins_date + ' at ' + begins_time + ' &ndash; ' + ends_date + ' at ' + ends_time + '</p>');
    return (i < 2);
  });

  eventElement.removeAttr('id');
  eventElement.attr('data-event_id', event.event_id);

  // Jos tapahtuma on merkitty suosikiksi, näytetään se suosikkina sivulla.
  if (isFavorite(event.event_id)) {
    eventElement.find('button:first').addClass('favored').html('<span class="glyphicon glyphicon-heart"></span> Suosikki');
  }

  $('#tapahtumat').append(eventElement);
}

// Haetaan tiedot suosikeista localStoragesta.
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

// Tallennetaan tiedot suosikeista localStorageen.
function setFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Tutkii onko tietty tapahtuma localStoragen suosikkilistalla.
function isFavorite(id) {
  var favorites = getFavorites();
  return _.includes(favorites, id);
}

// Lisätään suosikit sivun suosikkilistalle.
function addFavoritesOnPage(event_ids) {
  // Poistetaan mahdollinen virheilmoitus.
  $('[role="alert"]').remove();
  // Jos suosikkilista on tyhjä, näytetään virheilmoitus.
  if (event_ids.length === 0) {
    $('#fav-event').after('<div class="row><div class=col-md-12 alert alert-info" role="alert">Suosikkilistallasi ei ole tapahtumia.</div></div>');
  } else {
    // Muodostetaan hakuosoite, jolla haetaan tiedot tapahtumista rajapinnan cardlistiltä.
    var searchAddress = 'https://visittampere.fi/api/cardlist?ids=';
    $.each(event_ids, function(i, event_id) {
      searchAddress += event_id;
      if (i < event_ids.length - 1) {
        searchAddress += ',';
      }
    });

    // Haetaan suosikkitapahtumien tiedot rajapinnasta.
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: searchAddress,
      success: function(response){
        // Hyödynnetään makeEvents -funktiota lajittelun takia, mutta ei rajata menneitä eikä tulevia
        // tapahtumia pois suosikkilistalta.
        var events = makeEvents(response, moment('2000-01-01').valueOf(), moment('3000-01-01').valueOf());
        $.each(events, function(i, event) {
          var favEventElement = $('#fav-event').clone(true);
          favEventElement.find('h2').html(event.title + ' <small>' + ((event.contact_info.address === null) ? '' : event.contact_info.address + ', ') +
            ((event.contact_info.city === null) ? 'Tampere' : event.contact_info.city) + '</small>');
          favEventElement.find('.kuvaus').text(event.description);
          favEventElement.find('.kuva').html('<img src="' + event.image.src + '" alt="' + event.image.title + '" />');
          favEventElement.find('.info').html('<a href="' + event.contact_info.link + '" target="_blank">Lisätietoja</a>');

          if (event.occurrences.length !== 0) {
            var begins_date = moment(event.occurrences[0].begins).format("D.M.YYYY");
            var begins_time = moment(event.occurrences[0].begins).format("H.mm");
            var ends_date = moment(event.occurrences[0].ends).format("D.M.YYYY");
            var ends_time = moment(event.occurrences[0].ends).format("H.mm");

            favEventElement.find('.ajat ').append('<p>' + begins_date + ' at ' + begins_time + ' &ndash; ' + ends_date + ' at ' + ends_time + '</p>');
          }

          favEventElement.removeAttr('id');
          favEventElement.attr('data-event_id', event.event_id);
          $('#favorite-events').append(favEventElement);
        });
      },
      headers: {
        "Accept-Language": ''
      },
      error: function() {
        alert( "Tiedon noutaminen ei onnistunut" );
      }
    });
  }
}

/*
 * Karttametodit.
 */

// Luodaan kartta, jonka keskipisteenä on Tampere.
function initMap() {
  var tampere = {lat: 61.507756, lng: 23.760240};
  // Globaali karttamuuttuja.
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: tampere
  });
}

// Näytetään tapahtumat kartalla.
function showEventsOnMap(map, events) {
  geocoder = new google.maps.Geocoder();
  var markers = [];
  var i = 0;
  // Käytetään markerclustereria.
  var markerclusterer = new MarkerClusterer(map, [],
    {imagePath: 'images/m'});
  $.each(events, function(index, event){
    var address = event.contact_info.address + ', ' + event.contact_info.city;
    var title = event.title;
    geocoder.geocode({'address': address}, function(results, status) {
      var marker;
      if (status === 'OK') {
        var lat = results[0].geometry.location.lat();
        // Piirretään samassa paikassa sijaitsevat tapahtumat hieman erilleen toisistaan,
        // jotta molempien markerit näkyvät kartalla eivätkä ole päällekkäin.
        var lng = results[0].geometry.location.lng() + 0.00004 * i;
        marker = new google.maps.Marker({
          position: {lat: lat, lng: lng},
          title: title + ', ' + address
        });
        markerclusterer.addMarker(marker);

        // Lisätään markeriin infoikkuna.
        var infowindow = new google.maps.InfoWindow({
          content: marker.title
        });
        // Avataan infoikkuna, kun markeria klikataan.
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
        i++;
      }
    });
    // Näytetään max. 10 tapahtumaa kartalla.
    return index < 9;
  });
}
