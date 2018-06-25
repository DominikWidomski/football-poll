// Would be interesting to see how we could post a poll to several slack groups and keep them in sync.
// Can we modify messages, and their options with the names of people? (slackGroupName@userName e.g. digital-detox@dddom)
// 
// options:
// 	--message|-m <message>: what to override the default message to
// 	--no-message: if set no message will be generated, default or set
// 	--days <indecies>: specify which days to include, if not full working week
// 		e.g.: --days="2 3 4 5" to exclude monday
// 	--time <time|range>: specify when would be preferred time to play
// 		e.g.: --time="12:00:00"
// 		e.g.: --time="12:00:00-13:00:00"
// 	
// output:
// 	<message> <options>

const fetch = require('node-fetch').default;
// const { fetch } = require('whatwg-fetch');

const apiKey = "8eaab28b8e0df31330696c45d587517e"; // FIXME put in process ENV

// Had to make it const to not move it because then `const fetch` above isn't hoisted either
const getData = async () => { // TODO: extract into a separate file
    // console.log("FETCH IS:", fetch, typeof fetch);
    let output;

    console.log("fetch is", typeof fetch);
    
    // TODO: don't need `output` I think 
    await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=51.4613&lon=0.1156&mode=json&appid=${apiKey}`, {
        method: "GET"
    })
        .then(response => response.json())
        .then(data => output = data)
        .catch(error => console.error('error', error));

    return output;
}

const kelvinToCelcius = (kelvinTemp) => { // TODO: move into utils
    return kelvinTemp - 273.15;
}

const isWeekday = (date) => {
    const day = (new Date(date)).getDay();

    return day < 6 && day > 0;
}

const processWeatherData = list => {
    const data = {};

    list.forEach(item => {
        const { dt, dt_txt, main, weather } = item;
        const [date, time] = dt_txt.split(' ');

        if (!isWeekday(date)) {
            return;
        }

        if (!data[date]) {
            data[date] = {
                breakdown: {}
            };
        }

        data[date].breakdown[time] = {
            dt,
            dt_txt,
            temp: kelvinToCelcius(main.temp),
            weather
        };
    });

    // Find most commonly occuring weather
    Object.keys(data).forEach(date => {
        const counts = {};
        const dateData = data[date];

        Object.keys(dateData.breakdown).forEach(time => {
            const timeData = dateData.breakdown[time];

            if (counts[timeData.weather[0].description]) {
                counts[timeData.weather[0].description]++;
            } else {
                counts[timeData.weather[0].description] = 1;
            }
        });

        let max = 0;
        let commonWeather;
        Object.keys(counts).forEach(description => {
            if (counts[description] > max) {
                max = counts[description];
                commonWeather = description;
            }
        });

        dateData.commonWeather = commonWeather;
    });

    return data;
}

module.exports = async function fetchPollOptions() {
    return processWeatherData((await getData()).list)
}