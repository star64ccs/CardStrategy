module.exports = {
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2025-09-22T02:15:32.628Z",
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "cardstrategy",
    "user": "postgres",
    "password": "",
    "ssl": false,
    "pool": {
      "min": 2,
      "max": 10,
      "idleTimeoutMillis": 30000
    }
  },
  "api": {
    "main": {
      "port": 3000,
      "host": "localhost",
      "cors": {
        "origin": "*",
        "credentials": true
      }
    },
    "bgs": {
      "port": 3001,
      "host": "localhost"
    },
    "smartCard": {
      "port": 3002,
      "host": "localhost"
    }
  },
  "workers": {
    "dataCollection": {
      "enabled": true,
      "interval": "0 */6 * * *",
      "batchSize": 100,
      "timeout": 300000
    },
    "priceUpdate": {
      "enabled": true,
      "interval": "0 */2 * * *",
      "batchSize": 50,
      "timeout": 180000
    },
    "imageProcessing": {
      "enabled": true,
      "interval": "0 */4 * * *",
      "batchSize": 20,
      "timeout": 600000
    },
    "feedbackProcessing": {
      "enabled": true,
      "interval": "0 */1 * * *",
      "batchSize": 25,
      "timeout": 120000
    },
    "modelTraining": {
      "enabled": false,
      "interval": "0 0 */7 * *",
      "batchSize": 1000,
      "timeout": 3600000
    },
    "qualityMonitoring": {
      "enabled": true,
      "interval": "0 */8 * * *",
      "batchSize": 200,
      "timeout": 300000
    }
  },
  "crawlers": {
    "bgs": {
      "enabled": true,
      "interval": "0 */8 * * *",
      "batchSize": 50,
      "timeout": 600000,
      "retries": 3,
      "delay": 1000
    },
    "ebay": {
      "enabled": true,
      "interval": "0 */4 * * *",
      "batchSize": 100,
      "timeout": 300000,
      "retries": 5,
      "delay": 2000
    }
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destinations": [
      "console",
      "file"
    ],
    "file": {
      "path": "logs/app.log",
      "maxSize": "10MB",
      "maxFiles": 5
    }
  },
  "security": {
    "jwt": {
      "secret": "your-secret-key",
      "expiresIn": "24h"
    },
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    }
  }
};