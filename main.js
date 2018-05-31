#!/bin/node

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

const fetch = require('node-fetch');

const apiKey = "8eaab28b8e0df31330696c45d587517e";

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const options = {
	message: 'Football this week guys?',
	time: '12:00:00'
};

async function getData() {
	return fetch(`http://api.openweathermap.org/data/2.5/forecast?q=London,uk&mode=json&appid=${apiKey}`, {
		method: "GET"
	})
		.then(response => response.json())
		.catch(error => console.error('error', error));
}

function kelvinToCelcius(kelvinTemp) {
	return kelvinTemp - 273.15;
}

const slackIcons = {
	"clear sky": ":sunny:",
	"scattered clouds": ":sun_behind_cloud:",
	"broken clouds": ":cloud:",
	"light rain": ":rain_cloud:",
};

// const weatherIcons = {
// 	"01d": 🌧, // clear sky
// 	"01n": 🌧, // clear sky
// 	"02d": ☀️, // clear sky
// 	"02n": ☀️, // clear sky
// 	"03d": ☁️, // scattered clouds
// 	"03n": ☁️, // scattered clouds
// 	"04d": ☁️, // broken clouds
// 	"04n": ☁️, // broken clouds
// 	"10d": 🌧, // light rain
// 	"10n": 🌧, // light rain
// };

function findClosestTimeData(time, breakdown) {
	debugger;
	if (breakdown[time]) {
		return breakdown[time];
	}
	
	let closestDistance = Infinity;
	let bestMatch;
	
	Object.keys(breakdown).forEach(key => {
		const timeData = breakdown[key];
		const d1 = new Date('01 Jan 1970 ' + key);
		const d2 = new Date('01 Jan 1970 ' + options.time);

		const distance = Math.abs(d1 - d2);

		if (distance < closestDistance) {
			closestDistance = distance;
			bestMatch = timeData;
		}
	});

	return bestMatch;
}

function processWeatherData(list) {
	const data = {};

	list.forEach(item => {
		const { dt, dt_txt, main, weather } = item;
		const [date, time] = dt_txt.split(' ');

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

async function main() {
	console.log("Retrieving weather data...");
	const weatherData = processWeatherData((await getData()).list);
	console.log("✅ Weather retrieved");

	const days = Object.keys(weatherData).reduce((prev,date) => {
		const { commonWeather } = weatherData[date];
		const { temp } = findClosestTimeData(options.time, weatherData[date].breakdown);
		const dayName = dayNamesShort[(new Date(date)).getDay()];

		return prev + `"${dayName} ${Math.round(temp)}˚C ${slackIcons[commonWeather]}" `;
	}, '');
	
	process.stdout.write(`/poll "${options.message}" ${days}\n`);
}

main();
