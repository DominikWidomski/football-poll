const options = require('./options');
const fetchPollOptions = require('./pollOptionsFetcher');
const formatPollOptions = require('./formatPollOptions');

module.exports = async function constructPoll(config) {
    config = Object.assign({}, options, config);

    console.log("Retrieving weather data...");
    const weatherData = await fetchPollOptions();
    console.log("✅ Weather retrieved");
    
    const days = formatPollOptions(weatherData);

    return days;

    // const pollMessage = `/poll "${config.message}" ${days.join(' ')}`;
    // process.stdout.write(`${pollMessage}\n`);
    
    // return pollMessage;
}