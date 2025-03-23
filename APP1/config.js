module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://mongo1:27017/mainAppdb',
  redisURI: process.env.QUEUE_URI || "redis://redis-server:6379",
};
