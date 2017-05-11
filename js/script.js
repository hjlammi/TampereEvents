
$('.dropdown-toggle').dropdown();
$('.dropdown-menu li a').click(function(){
  $('#dropdownMenu1').text($(this).text());
});

// Haetaan tiedot.
$('#submit').on('click', function(){
  // Tyhjennetään DOM:sta edellisen hauan antamat tapahtumat.
  $('.tapahtuma:not(#tapahtuma)').remove();

  // Kutsutaan metodia, joka palauttaa hakuun tarvittavat parametrit.
  var searchParameters = getSearchParameters();
  console.log(searchParameters);
  getData(searchParameters);
});

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
  $('input[name="date"]').daterangepicker({
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
    minDate: todayAsDate
  });

  getData(getSearchParameters());
  // Piirretään kartta ilman markereita, kun sivu on valmis.
  initMap();
});

function showResultsOnPage(apiData, start_datetime) {
  initMap();
  var events = showEventsOnPage(apiData, start_datetime);
  showEventsOnMap(map, events);
}


function showEventsOnPage(apiData, searchDate) {
  var events = makeEvents(apiData, searchDate);
  var eventsOnPage = [];
  $.each(events, function(i, event) {
    addEventOnPage(event);
    eventsOnPage.push(event);
  });
  return eventsOnPage;
}

/*
 * Apumetodit.
 */

// Luodaan kartta, jonka keskipisteenä on Tampere.
function initMap() {
  var tampere = {lat: 61.507756, lng: 23.760240};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: tampere
  });
}

function showEventsOnMap(map, events) {
  geocoder = new google.maps.Geocoder();
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
        var lng = results[0].geometry.location.lng() + 0.00004 * i;
        markerclusterer.addMarker(new google.maps.Marker({
          position: {lat: lat, lng: lng},
          title: title + ', ' + address,
        }));
        i++;
      }
    });
  });
}

// Lisätään tapahtuman tiedot sivulle.
function addEventOnPage(event) {
  var eventElement = $('#tapahtuma').clone();
  eventElement.find('h2').html(event.title + ' <small>' + ((event.contact_info.address === null) ? '' : event.contact_info.address + ', ') +
    ((event.contact_info.city === null) ? 'Tampere' : event.contact_info.city) + '</small>');
  eventElement.find('.kuvaus').text(event.description);
  eventElement.find('.kuva').html('<img src="' + event.image.src + '" alt="' + event.image.title + '" />');
  eventElement.find('.info').html('<a href="' + event.contact_info.link + '" target="_blank">Lisätietoja</a>');

  // Tapahtuman ajoista näytetään vain kolme ensimmäistä.
  $.each(event.occurrences, function(i, o) {
    var begins_date = moment(o.begins).format("D.M.YYYY");
    var begins_time = moment(o.begins).format("k.mm");
    var ends_date = moment(o.ends).format("D.M.YYYY");
    var ends_time = moment(o.ends).format("k.mm");

    eventElement.find('.ajat ').append('<p>' + begins_date + ' at ' + begins_time + ' &ndash; ' + ends_date + ' at ' + ends_time + '</p>');
    return (i < 2);
  });

  eventElement.removeAttr('id');
  $('#tapahtumat').append(eventElement);
}

function getSearchParameters() {
  // Haetaan aina pelkkiä tapahtumia (event) ja asetetaan limitiksi 100, jotta saadaan
  // kaikki tapahtumat eikä vain kymmentä satunnaista.
  var searchParameters = {type: 'event', limit: 100};


  var category = $('#dropdownMenu1').text();
  console.log(category);
  if (category !== 'Kategoria' || category !== Kaikki) {
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

  var picker = $('input[name="date"]').data('daterangepicker');

  searchParameters.start_datetime = picker.startDate.valueOf();
  searchParameters.end_datetime = picker.endDate.valueOf();

  return searchParameters;
}
