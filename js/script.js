
var searchParameters = {type: 'event', limit: 100};

$('.dropdown-toggle').dropdown();
$('.dropdown-menu li a').click(function(){
  $('#dropdownMenu1').text($(this).text());
});


// Haetaan tiedot.
$('button[name="submit"]').on('click', function(){
  // var start_datetime = Date.parse(new Date());
  // var end_datetime = Date.parse(new Date()) + 14*24*60*60*1000;
  getData(searchParameters);
});

function getData(searchParameters) {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    data: searchParameters,
    url: "https://visittampere.fi/api/search",
    success: showResultsOnPage,
    headers: {
      "Accept-Language": ''
    },
    error: function() {
      alert( "Tiedon noutaminen ei onnistunut" );
    }
  });
}
$(document).ready(function() {
  searchParameters.start_datetime = Date.parse(new Date());
  searchParameters.end_datetime = Date.parse(moment().endOf('day'));
  getData(searchParameters);
  // Piirretään kartta ilman markereita, kun sivu on valmis.
  initMap();
});

function showResultsOnPage(apiData) {
  var events = showEventsOnPage(apiData);
  showEventsOnMap(map, events);
}


function showEventsOnPage(apiData) {
  var events = makeEvents(apiData);
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
