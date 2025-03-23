module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://mongo2:27017/mainAppdb2',
  redisURI: process.env.QUEUE_URI || "redis://redis-server:6379",
};
