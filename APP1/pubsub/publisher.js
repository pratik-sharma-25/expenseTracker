const redis = require('redis');
const config = require('../config');

const publish = async (channel, message) => {
    const client = redis.createClient({ url: config.redisURI });
    await client.connect();
    await client.publish(channel, message);


    client.on('error', (err) => {
        console.log("Error " + err);
    });
}

module.exports = publish;