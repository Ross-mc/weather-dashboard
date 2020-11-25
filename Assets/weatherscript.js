$(function(){

    const APIKey = "60f60127e3114e968bdfe2591489ab29";

    class weatherObj {
      constructor(day, temperature, weather, icon, humidity, windspeed){
        this.day = day;
        this.temperature = temperature;
        this.weather = weather;
        this.icon = icon;
        this.humidity = humidity;
        this.windspeed = windspeed
      }
    };


    const weatherArr = [];



    $("#submit-btn").on("click", function(event){
      event.preventDefault();

      var userInput = $("#user-search").val().trim().toLowerCase();

      var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${userInput}&appid=${APIKey}`;

      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
        // the response includes an array called list. Each element is the next 3 hour block
        // we handle today seperately because we need to chain a uv request and because we use whatever the current time is
  
        var dayArr = response.list;
        var today = dayArr[0];
  
  
        var tempResponse = (parseInt(today.main.temp)- 273.15).toFixed(2);
  
        var weatherResponse = today.weather[0].description;
  
        var iconResponse = today.weather[0].icon;
  
        var humidityResponse = today.main.humidity;
  
        var windResponse = today.wind.speed;
  
        var todayObj = new weatherObj(
          "Now",
          tempResponse,
          weatherResponse,
          iconResponse,
          humidityResponse,
          windResponse
        );
  
        weatherArr.push(todayObj);
  
  
  
        var lat = response.city.coord.lat;
        var lon = response.city.coord.lon;
  
        var uvResponse;
  
        var uvQueryURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`
  
        $.ajax({
            url: uvQueryURL,
            method: "GET"
        }).then(function(response){
            uvResponse = response.value
  
            weatherArr[0].uvIndex = uvResponse;
  
        });
  
        var currentDate = today.dt_txt;
  
        // for loop for the remaining days
        for (let i = 1; i<dayArr.length; i++){
          var day = dayArr[i];
          var date = day.dt_txt;
  
          //to ensure we do not repeat today's forecast
          if (date === currentDate){
            break;
          }
          //we are going to use 15:00 as the forecast temp
          if (date.endsWith("15:00:00")){
            date = date.substr(0, 10);
            var dayTemp = (parseInt(day.main.temp)-273.15).toFixed(1);
            var dayWeather = day.weather[0].description;
            var dayIcon = day.weather[0].icon;
            var dayHumidity = day.main.humidity;
            var dayWind = day.wind.speed;
    
            var dayObj = new weatherObj(
              date,
              dayTemp,
              dayWeather,
              dayIcon,
              dayHumidity,
              dayWind
            );
            weatherArr.push(dayObj);
          }
  
        }
  
        console.log(weatherArr)
  
  
  
      })
      
    })




})