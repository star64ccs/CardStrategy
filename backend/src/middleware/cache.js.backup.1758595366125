const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 300, // 5分鐘默認TTL
  checkperiod: 120, // 2分鐘檢查過期
  useClones: false
});

const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      cache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { cacheMiddleware, cache };