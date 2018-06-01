const options = require('./options');
const fetchPollOptions = require('./pollOptionsFetcher');
const formatPollOptions = require('./formatPollOptions');

module.exports = async function constructPoll() {
    console.log("Retrieving weather data...");
    const weatherData = await fetchPollOptions();
    console.log("✅ Weather retrieved");

    const days = formatPollOptions(weatherData);

    process.stdout.write(`/poll "${options.message}" ${days}\n`);
}