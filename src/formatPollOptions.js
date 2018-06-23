const options = require('./options');

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const slackDayIcons = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:'];

const slackIcons = {
    "clear sky": ":sunny:",
    "scattered clouds": ":sun_behind_cloud:",
    "broken clouds": ":cloud:",
    "overcast clouds": ":cloud:",
    "few clours": ":cloud:",
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

// TODO: this needs testing
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
    return Object.keys(weatherData).map(date => {
        // TODO: this should probably be in pollOptionsFetcher::processWeatherData
        // and this should be a simple utility
        const { commonWeather } = weatherData[date];
        const { temp } = findClosestTimeData(options.time, weatherData[date].breakdown);
        const dayIndex = (new Date(date)).getDay() - 1;
        const slackIcon = slackDayIcons[dayIndex]; // TODO: don't like this being here really
        const dayName = dayNamesShort[dayIndex];

        console.log("Common weather", date, commonWeather);
        return `${slackIcon} ${dayName} ${date} ${Math.round(temp)}˚C ${slackIcons[commonWeather]} (${commonWeather})`;
    });
}
