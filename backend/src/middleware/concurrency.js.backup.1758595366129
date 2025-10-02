const pLimit = require('p-limit');

const concurrencyLimiter = (limit = 10) => {
  const limitFn = pLimit(limit);
  
  return (req, res, next) => {
    req.concurrencyLimit = limitFn;
    next();
  };
};

module.exports = concurrencyLimiter;