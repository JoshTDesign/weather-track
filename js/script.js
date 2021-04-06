// Global variables
var searchedArray = [];
var currentDate;
var currentConditions;
var currentTemp;
var currentHumidity;
var currentWind;
var currentUv;
var currentIcon;
var currentCity;
var forecastDate;
var forecastIcon;
var forecastTemp;
var forecastHumidity;
var uvColor;


//checks the past search array and fills the history list
function initPage(){
    $('#history').children().remove();    
    var tempArray = JSON.parse(localStorage.getItem('searchedArray'));
    console.log(tempArray);
    if (tempArray != null) {
      searchedArray = tempArray;
    }

    searchedArray.reverse();
    for (var i = 0; i < searchedArray.length; i++) {
        var cityLi = document.createElement('li');
        cityLi.textContent = searchedArray[i]
        cityLi.setAttribute('class','list-group list-group-item');
        cityLi.setAttribute('id',searchedArray[i]);
        $('#history').append(cityLi);
    }
    searchedArray.reverse();
};

//fetches the api weather data for the current day, then calls the forecast function
function getCurrent(city) {
  var searchUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=b8e4a5fc7efffbddda3bb2a508702e23&units=imperial'
  fetch(searchUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    currentCity = data.name;
    currentDate = moment.unix(data.dt).format('dddd, ll');
    currentConditions = data.weather[0].description;
    currentIcon = 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png';
    currentTemp = Math.floor(data.main.temp);
    currentHumidity = Math.floor(data.main.humidity);
    currentWind = (Math.floor(data.wind.speed));
    var cityLon = data.coord.lon;
    var cityLat = data.coord.lat;
    renderCurrent();
    getForecast(cityLon, cityLat);
  });
}

//one call api retreives forecast data
function getForecast (lon, lat) {
  searchUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&appid=b8e4a5fc7efffbddda3bb2a508702e23&units=imperial';
  fetch(searchUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {

    // if statement to detect uv level and return a color
    currentUv = data.current.uvi;
    if (currentUv <= 2) {
      uvColor = 'bg-success';
    } else if (currentUv >= 3 && currentUv <= 5) {
      uvColor = 'bg-warning';
    } else {
      uvColor = 'bg-danger';
    }

    // puts uv level in currentDiv and puts color in backround
    $('<p/>', {"class": uvColor}).text('UV Index: ' + currentUv).appendTo('#currentDiv');

    //this for loop creates and populates the forecast div
    for (var i=0; i<5; i++) {
      $('<div/>', {id: 'forecast'+i, "class": 'forecast card-body border'}).appendTo('#forecastDiv');
      var thisDay = moment.unix(data.daily[i].dt).format('dddd');
      var thisDate = moment.unix(data.daily[i].dt).format('ll');
      $('<h1/>', {id: 'date', "class": 'card-title h3 text-start'}).text(thisDay).appendTo('#forecast'+i);
      $('<h2/>', {id: 'date', "class": 'card-subtitle mb-2 text-muted h6 text-start wrap'}).text(thisDate).appendTo('#forecast'+i);
      var thisIcon = 'http://openweathermap.org/img/w/' + data.daily[0].weather[0].icon + '.png';
      $('<img/>', {src: thisIcon}).appendTo('#forecast'+i);
      $('<p/>', {id: 'temp', "class": 'text-start'}).text('Termperature: ' + Math.floor(data.daily[i].temp.day)).appendTo('#forecast'+i);
      $('<p/>', {id: 'humidity', "class": 'text-start'}).text('Humidity: ' + Math.floor(data.daily[i].humidity)).appendTo('#forecast'+i);
    }
  });
}



function renderCurrent() {
  //Removes content from div
  $("#placeHolderDiv").children().remove();

  //Puts current weather information on page
  $('<div/>', {id: 'currentDiv', "class": ''}).appendTo('#placeHolderDiv');
  $('<div/>', {id: 'forecastDiv', "class": 'd-flex flex-row card'}).appendTo('#placeHolderDiv');
  $('<h1/>').text(currentCity).appendTo('#currentDiv');
  $('<h2/>').text(currentDate).appendTo('#currentDiv');
  $('<img/>', {src: currentIcon}).appendTo('#currentDiv');
  $('<p/>').text('Temperature: ' + currentTemp).appendTo('#currentDiv');
  $('<p/>').text('Humidity: ' + currentHumidity).appendTo('#currentDiv');
  $('<p/>').text('Wind Speed: ' + currentWind).appendTo('#currentDiv');
}


function saveSearch(city){
//checks the saved search array for local updates, then sets the newest search input into the array
    var tempArray = JSON.parse(localStorage.getItem('searchedArray'));
    console.log(city);
    console.log(tempArray);
    if (tempArray != null) {
      searchedArray = tempArray;
    }
    searchedArray.push(city);
    console.log(searchedArray);
    localStorage.setItem('searchedArray', JSON.stringify(searchedArray));

    console.log(searchedArray.length);
    if (searchedArray.length > 10) {
        searchedArray.shift();
        console.log(searchedArray.length);
    }
};

//Button listener for search button
$('#searchButton').on('click', function(){
    var searchCityInput = $('#searchField').val();
    saveSearch(searchCityInput);
    getCurrent(searchCityInput);
    initPage();
})

//Listener for history list
$("#history").on('click', 'li', function() {
  getCurrent(this.id);
})

initPage();



