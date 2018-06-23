const btoa = require('btoa');

module.exports = function(data) {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const character = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }

    return btoa(hash);
}