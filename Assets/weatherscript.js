$(function(){
    //global variables

    const APIKey = "60f60127e3114e968bdfe2591489ab29";

    class WeatherObj {
      constructor(day, temperature, weather, icon, humidity, windspeed){
        this.day = day;
        this.temperature = temperature;
        this.weather = weather;
        this.icon = icon;
        this.humidity = humidity;
        this.windspeed = windspeed;
        this.uvIndex = "";
      }
    };

    let weatherArr = [];

    let currentCircleIndex = 0;

    //local storage

    var searchHistory = [];

    if (JSON.parse(localStorage.getItem("searchArray") !== null)){
      searchHistory = JSON.parse(localStorage.getItem("searchArray"));
      var historyBtn = $("<button id='history-dropdown'>");
      historyBtn.text('Your Search History');
      var dropdownEl = $("<i class='fas fa-caret-down'></i>");
      historyBtn.append(dropdownEl);
      var historyContainer = $("<div class='history-container'>");
      $("body").append(historyBtn, historyContainer);

    }



    function displayWeather(event){
      event.preventDefault();



      //fade out front page container
      $(".front-container").fadeOut(400);

      //resets
      currentCircleIndex = 0;
      $(".container").fadeOut(100);
      $(".circles").fadeOut(400);
      $(".circle").addClass("off").removeClass("on");
      $("#circle-0").removeClass("off").addClass("on");

      var userInput = "";

      if ($(this).attr("id") === "submit-btn"){
        userInput = $("#user-search").val().trim().toLowerCase();
        if (!searchHistory.includes(userInput)){
          searchHistory.unshift(userInput);
        }

        localStorage.setItem("searchArray", JSON.stringify(searchHistory));
        $("#user-search").val("");
      } else{
        userInput = $(this).attr('data-city');
      }


      var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${userInput}&appid=${APIKey}`;

      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
        // the response includes an array called list. Each element is the next 3 hour block
        // we handle today seperately because we need to chain a uv request and because we use whatever the current time is

        weatherArr = []; //clear out the existing weatherArr for a new search
        $(".container").empty(); //clear out the container div of previous weather cards
  
        var dayArr = response.list;
        var today = dayArr[0];
  
  
        var tempResponse = (parseInt(today.main.temp)- 273.15).toFixed(1);
  
        var weatherResponse = today.weather[0].description;
  
        var iconResponse = today.weather[0].icon;
  
        var humidityResponse = today.main.humidity;
  
        var windResponse = today.wind.speed;
  
        var todayObj = new WeatherObj(
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

            var uvEl = $("<p class='bottom-icons'>");
            var uvIndex = dayObj.uvIndex;
            uvEl.text(uvIndex);
            uvIndex = parseFloat(uvIndex);
            if (uvIndex <= 2.9999){
              uvEl.addClass('low-uv');
            } else if (uvIndex <6){
              uvEl.addClass('medium-uv');
            } else if (uvIndex <8){
              uvEl.addClass('high-uv');
            } else if (uvIndex <11){
              uvEl.addClass('very-high-uv')
            } else{
              uvEl.addClass('extremely-high-uv')
            }

            //this is not working!!!!
            // var containerArr = $(".container").children();
            // containerArr[0].appendChild(uvEl);

            //this is not working!!!!!
  
        });
  
        var currentDate = today.dt_txt.substr(0,10);
  
        // for loop for the remaining days
        for (let i = 1; i<dayArr.length; i++){
          var day = dayArr[i];
          var date = day.dt_txt;
  
          //to ensure we do not repeat today's forecast
          if (date.substr(0,10) === currentDate){
            continue;
          }
          //we are going to use 15:00 as the forecast time for all the datapoints
          if (date.endsWith("15:00:00")){
            date = date.substr(0, 10);
            var dayTemp = (parseInt(day.main.temp)-273.15).toFixed(1);
            var dayWeather = day.weather[0].description;
            var dayIcon = day.weather[0].icon;
            var dayHumidity = day.main.humidity;
            var dayWind = day.wind.speed;
    
            var dayObj = new WeatherObj(
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

        // create the weather elements on the div

        //sometimes depending on the time of day we accidentally create a 6th day, so we perform a quick check and remove it

        if (weatherArr.length === 6){
          weatherArr.pop();
        }

        var positionLeft = 0;
        for (let i = 0; i<weatherArr.length; i++){
          var dayObj = weatherArr[i];
          //create new weather-card
          var weatherCardDiv = $("<div class='weather-card'>");
          weatherCardDiv.attr("id", `day-card-${i}`);
          weatherCardDiv.css("left", positionLeft+"vw");
          positionLeft+=150;


          //populate information in to card

          var dateHeader = $("<h2 class='date-header'>");
          var date = dayObj.day;

          if (date == 'Now'){
            dateHeader.text(date)
          } else{
            //REFORMATTING THE DATE FROM 2020-11-25 TO 25-11-2020
            var year = date.substr(0, 4);
            var month = date.substr(5, 2);
            var day = date.substr(8,2);
            var reformattedDate = day + '-' + month + '-' + year;
            dateHeader.text(reformattedDate);
          }


          var temperatureEl = $("<h3 class='temperature-header'>");
          temperatureEl.text(dayObj.temperature + '°C');

          var weatherEl = $("<p class='weather-para'>");
          var weather = dayObj.weather;
          weather = weather.split("");
          weather[0] = weather[0].toUpperCase();
          weather = weather.join("");
          weatherEl.text(weather);

          var iconImg = $("<img class='weather-icon'>");
          var iconFile = dayObj.icon;
          var iconArr = iconFile.split("");
          if (iconArr[2] === "n"){
            iconArr[2] = "d"
          };

          iconFile = iconArr.join("");
          var iconSrc = `http://openweathermap.org/img/wn/${iconFile}@4x.png`;
          iconImg.attr("src", iconSrc);

          var humidityEl = $("<p class='bottom-icons'>");
          humidityEl.text("Humidity: " + dayObj.humidity + '%');

          //append information in to card

          weatherCardDiv.append(dateHeader, temperatureEl, weatherEl, iconImg, humidityEl)

          //append new weather card to DOM
          $(".container").append(weatherCardDiv)


        }

        var cityHeader = $("<h1 class='location'>");
        userInput = userInput.charAt(0).toUpperCase() + userInput.slice(1);
        cityHeader.text(userInput + " ~ 5 day forecast");

        $(".container").append(cityHeader).fadeIn(750)
        //display the movement div

        $(".circles").fadeIn(750)
  
  
  
      })
      
    }


    $("#submit-btn").on("click", displayWeather);

    $("body").on("click", 'button#history-dropdown', function(){
      var historyContainer = $(".history-container");
      historyContainer.empty();
      var ulEl = $("<ul id='history-list'>")
      for (let i = 0; i<searchHistory.length; i++){
        var liEl = $("<li class='history-item'>");
        var btnEl = $("<button class='history-btn'>");
        btnEl.attr("data-city", searchHistory[i]);
        btnEl.text(searchHistory[i]);
        liEl.append(btnEl);
        ulEl.append(liEl);

      };
      historyContainer.append(ulEl);
    });

    $("body").on("click", 'button.history-btn', displayWeather)





    $(".move-btn").on("click", function(){
      let clicked = $(this).attr("id");
      if ((clicked === 'right' && currentCircleIndex === 4) || (clicked === 'left' && currentCircleIndex === 0)){
        return
      };
      if (clicked === 'left'){
        $(".weather-card").animate({
          left: "+=150vw"
        }, 750)
      } else {
        $(".weather-card").animate({
          left: "-=150vw"
        }, 750)
      }
      if (clicked === "left"){
        currentCircleIndex--
      } else {
        currentCircleIndex++
      }
      $(".circle").removeClass("off").removeClass("on");
      $(".circle").addClass("off");
      $(`#circle-${currentCircleIndex}`).removeClass('off').addClass('on');



    })




})