const options = require('./options');

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

const findClosestTimeData = (time, breakdown) => {
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

module.exports = function formatPollOptions(weatherData) {
    return Object.keys(weatherData).reduce((prev, date) => {
        const { commonWeather } = weatherData[date];
        const { temp } = findClosestTimeData(options.time, weatherData[date].breakdown);
        const dayName = dayNamesShort[(new Date(date)).getDay()];

        return prev + `"${dayName} ${Math.round(temp)}˚C ${slackIcons[commonWeather]}" `;
    }, '');
}