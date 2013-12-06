/* contact.js */

registerOnLoadHandler(function() { setTimeout(initialise, 100); }); /* requires site.js */

function initialise() {
  var latlng = new google.maps.LatLng(51.5252, -0.090486);
  var myOptions = {
    zoom: 16,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: "RabbitMQ",
    icon: "img/rabbitmq_logo_30x30.png"
  });
}
