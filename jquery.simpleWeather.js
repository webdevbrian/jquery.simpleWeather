/*! simpleWeather v3.2.0 - http://simpleweatherjs.com */
(function($) {
  'use strict';

  $.extend({
    simpleWeather: function(options){
      options = $.extend({
        location: '',
        apiKey: '8c841aee3f8442a8',
        unit: 'f',
        success: function(weather){},
        error: function(message){}
      }, options);

      //http://api.wunderground.com/api/8c841aee3f8442a8/conditions/q/CA/San_Francisco.json
      // need to format location.
      //
      var weatherUrl = 'http://api.wunderground.com/api/'+options.apiKey+'/conditions/q/'+options.location+'.json'; //add parameters for location

      if(options.location !== '') {
        /* If latitude/longitude coordinates, need to format a little different. */
        var location = '';
        if(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test(options.location)) {
          location = '(' + options.location + ')';
        } else {
          location = options.location;
        }

      $.getJSON(
        encodeURI(weatherUrl),
        function(data) {
          if(data !== null && data.query !== null && data.query.results !== null && data.query.results.channel.description !== 'Weather Underground Error') {
            var result = data,
                weather = {},
                forecast,
                compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'],
                image404 = 'https://s.yimg.com/os/mit/media/m/weather/images/icons/l/44d-100567.png';

            weather.title = 'Conditions for '+result.full+' at '+result.local_time_rfc822;
            weather.temp = result.temp_+options.unit; // result.temp_f or result.temp_c
            //weather.code = result.item.condition.code;
            //weather.todayCode = result.item.forecast[0].code;
            weather.temperature_string = result.temperature_string;
            weather.currently = result.weather;
            //weather.high = result.item.forecast[0].high;
            //weather.low = result.item.forecast[0].low;
            //weather.text = result.item.forecast[0].text;
            weather.humidity = result.relative_humidity;
            weather.pressure = result.pressure_in;
            weather.pressureMB = result.pressure_mb; /* NEW */
            weather.rising = result.pressure_trend; /* NEW - returns + or - */
            weather.visibility = result.visibility_mi; /* CHANGED - response is either MI or KM (visibility_mi or visibility_km) */
            //weather.sunrise = result.astronomy.sunrise;
            //weather.sunset = result.astronomy.sunset;
            weather.description = result.item.description; // not in docs to say what this returned?
            weather.city = result.city;
            weather.country = result.country;
            //weather.region = result.location.region;
            weather.observation_time = result.item.pubDate;
            weather.link = result.forecast_url;

            weather.units = {temp: options.unit, distance: 'distance is deprecated', pressure: result.pressure_in, speed: result.units.speed};

            weather.wind = {chill: result.wind.chill, direction: compass[Math.round(result.wind.direction / 22.5)], speed: result.wind.speed};

            if(result.item.condition.temp < 80 && result.atmosphere.humidity < 40) {
              weather.heatindex = -42.379+2.04901523*result.item.condition.temp+10.14333127*result.atmosphere.humidity-0.22475541*result.item.condition.temp*result.atmosphere.humidity-6.83783*(Math.pow(10, -3))*(Math.pow(result.item.condition.temp, 2))-5.481717*(Math.pow(10, -2))*(Math.pow(result.atmosphere.humidity, 2))+1.22874*(Math.pow(10, -3))*(Math.pow(result.item.condition.temp, 2))*result.atmosphere.humidity+8.5282*(Math.pow(10, -4))*result.item.condition.temp*(Math.pow(result.atmosphere.humidity, 2))-1.99*(Math.pow(10, -6))*(Math.pow(result.item.condition.temp, 2))*(Math.pow(result.atmosphere.humidity,2));
            } else {
              weather.heatindex = result.item.condition.temp;
            }

            if(result.item.condition.code == '3200') {
              weather.thumbnail = image404;
              weather.image = image404;
            } else {
              weather.thumbnail = 'http://icons-ak.wxug.com/i/c/k/' + result.item.condition.code + '.gif'; // http://icons-ak.wxug.com/i/c/k/partlycloudy.gif
              weather.image = 'http://icons-ak.wxug.com/i/c/k/' + result.item.condition.code + '.gif'; // http://icons-ak.wxug.com/i/c/k/partlycloudy.gif
            }

            weather.alt = {temp: getAltTemp(options.unit, result.item.condition.temp), high: getAltTemp(options.unit, result.item.forecast[0].high), low: getAltTemp(options.unit, result.item.forecast[0].low)};
            if(options.unit === 'f') {
              weather.alt.unit = 'c';
            } else {
              weather.alt.unit = 'f';
            }

            weather.forecast = [];
            for(var i=0;i<result.item.forecast.length;i++) {
              forecast = result.item.forecast[i];
              forecast.alt = {high: getAltTemp(options.unit, result.item.forecast[i].high), low: getAltTemp(options.unit, result.item.forecast[i].low)};

              if(result.item.forecast[i].code == "3200") {
                forecast.thumbnail = image404;
                forecast.image = image404;
              } else {
                forecast.thumbnail = 'https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/' + result.item.forecast[i].code + 'ds.png';
                forecast.image = 'https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/' + result.item.forecast[i].code + 'd.png';
              }

              weather.forecast.push(forecast);
            }

            options.success(weather);
          } else {
            options.error('There was a problem retrieving the latest weather information.');
          }
        }
      );
      return this;
    }
  });
})(jQuery);
