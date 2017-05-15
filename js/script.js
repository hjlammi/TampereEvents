// Globaali muuttuja tapahtumille.
var events;

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
    $('#dropdownMenu1').text($(this).text() + ' ');
    $('#dropdownMenu1').append('<span class="caret"></span>');
  });

  // Päivitetään tapahtumasivu klikkaamalla buttonia.
  $('#submit').on('click', function(){
    updateEventPage();
  });

  // Päivitetään tapahtumasivu enterillä.
  $('body').on('keypress', function(e) {
    if (e.keyCode === 13) {
      updateEventPage();
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
    $('.fav-event:not(#fav-event)').remove();
    var favorites = getFavorites();
    var thisEventId = parseInt($(this).parents('.tapahtuma').attr('data-event_id'));
    $(this).toggleClass('favored');
    if ($(this).hasClass('favored')) {
      $(this).html('<span class="glyphicon glyphicon-heart"></span> Suosikki');
      favorites.push(thisEventId);
    } else {
      $(this).text('Lisää suosikiksi');
      _.remove(favorites, function(id) {
        return id === thisEventId;
      });
    }
    setFavorites(favorites);
    addFavoritesOnPage(getFavorites());
  });

  // Suosikin poistaminen suosikeista suosikkilistan poistonapilla.
  $('.fav-event button').on('click', function() {
    var thisEventId = parseInt($(this).parents('.fav-event').attr('data-event_id'));

    bootbox.confirm('Haluatko varmasti poistaa tapahtuman suosikeista?', function(confirmed) {
      if (confirmed) {
        $('.fav-event:not(#fav-event)').remove();
        var favorites = getFavorites();
        _.remove(favorites, function(id) {
          return id === thisEventId;
        });
        setFavorites(favorites);
        addFavoritesOnPage(favorites);
        $(this).parents('.fav-event').remove();
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

  $('.tapahtuma button.on-map').on('click', function() {
    $(this).toggleClass('show');
    if ($(this).hasClass('show')) {
      initMap();
      var thisEventId = parseInt($(this).parents('.tapahtuma').attr('data-event_id'));
      $.each(events, function(i, event) {
        if (event.event_id === thisEventId) {
          var geocoder = new google.maps.Geocoder();
          console.log(event);
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
              var infowindow = new google.maps.InfoWindow({
                content: marker.title
              });
              marker.addListener('click', function() {
                infowindow.open(map, marker);
              });
            }
          });
        }
      });
    } else {
      initMap();
      showEventsOnMap(map, events);
    }
  });

  getData(getSearchParameters());
  // Piirretään kartta ilman markereita, kun sivu on valmis.
  initMap();

  addFavoritesOnPage(getFavorites());
});

function showResultsOnPage(apiData, start_datetime) {
  initMap();
  events = showEventsOnPage(apiData, start_datetime);
  showEventsOnMap(map, events);
}

function showEventsOnPage(apiData, searchBeginDate) {
  var picker = $('#datepicker1').data('daterangepicker');
  var searchEndDate = moment(picker.endDate).endOf('day').valueOf();
  var events = makeEvents(apiData, searchBeginDate, searchEndDate);
  addEventsOnPage(events);
  return events;
}

/*
 * Karttametodit.
 */

// Luodaan kartta, jonka keskipisteenä on Tampere.
function initMap() {
  var tampere = {lat: 61.507756, lng: 23.760240};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: tampere
  });
}

function showEventsOnMap(map, events) {
  geocoder = new google.maps.Geocoder();
  var marker;
  var markers = [];
  var i = 0;
  var markerclusterer = new MarkerClusterer(map, [],
    {imagePath: 'images/m'});
  $.each(events, function(index, event){
    var address = event.contact_info.address + ', ' + event.contact_info.city;
    var title = event.title;
    geocoder.geocode({'address': address}, function(results, status) {
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
        var infowindow = new google.maps.InfoWindow({
          content: marker.title
        });
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

function addEventsOnPage(events) {
  if (events.length === 0) {
    errorMessage();
  } else {
    $.each(events, function(i, event) {
      addEventOnPage(event);
    });
  }
}

function errorMessage() {
  $('#tapahtuma').after('<div class="row><div class=col-md-12 alert alert-info" role="alert">Hakuehtoja vastaavia tapahtumia ei löytynyt. Yritä uudelleen.</div></div>');
}

function updateEventPage() {
  // Tyhjennetään DOM:sta edellisen hauan antamat tapahtumat ja virheilmoitus.
  $('.tapahtuma:not(#tapahtuma)').remove();
  $('[role="alert"]').remove();
  // Kutsutaan metodia, joka palauttaa hakuun tarvittavat parametrit.
  var searchParameters = getSearchParameters();
  getData(searchParameters);
}

// Lisätään tapahtuman tiedot sivulle.
function addEventOnPage(event) {
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

  if (isFavorite(event.event_id)) {
    eventElement.find('button:first').addClass('favored').html('<span class="glyphicon glyphicon-heart"></span> Suosikki');
  }

  $('#tapahtumat').append(eventElement);
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function setFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(id) {
  var favorites = getFavorites();
  return _.includes(favorites, id);
}

function addFavoritesOnPage(event_ids) {
  $('[role="alert"]').remove();
  if (event_ids.length === 0) {
    $('#fav-event').after('<div class="row><div class=col-md-12 alert alert-info" role="alert">Suosikkilistallasi ei ole tapahtumia.</div></div>');
  } else {
    var searchAddress = 'https://visittampere.fi/api/cardlist?ids=';
    $.each(event_ids, function(i, event_id) {
      searchAddress += event_id;
      if (i < event_ids.length - 1) {
        searchAddress += ',';
      }
    });

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

function getSearchParameters() {
  // Haetaan aina pelkkiä tapahtumia (event) ja asetetaan limitiksi 100, jotta saadaan
  // kaikki tapahtumat eikä vain kymmentä satunnaista.
  var searchParameters = {type: 'event', limit: 100};


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

  if ($('#search').val() !== '') {
    searchParameters.text = $('#search').val();
  }

  if ($('#free').is(':checked')) {
    searchParameters.free = true;
  }

  var picker1 = $('#datepicker1').data('daterangepicker');
  searchParameters.start_datetime = picker1.startDate.valueOf();

  return searchParameters;
}
