$(function(){

    const APIKey = "60f60127e3114e968bdfe2591489ab29";

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=london&cnt=5&appid=" + APIKey;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      console.log(response)
      var today = response.list[0]

      var tempResponse = (parseInt(today.main.temp)- 273.15).toFixed(2);
      console.log(tempResponse);

      var weatherResponse = today.weather[0].description;
      console.log(weatherResponse);

      var iconResponse = today.weather[0].icon;
      console.log(iconResponse)

      var humidityResponse = today.main.humidity;
      console.log(humidityResponse);

      var windResponse = today.wind.speed;
      console.log(windResponse);


      var lat = response.city.coord.lat;
      var lon = response.city.coord.lon;

      var uvResponse;

      var uvQueryURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`

      $.ajax({
          url: uvQueryURL,
          method: "GET"
      }).then(function(response){
          uvResponse = response.value
          console.log(uvResponse);
      })


    })




})