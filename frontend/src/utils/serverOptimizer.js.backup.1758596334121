// 服務器優化工具
import cluster from 'cluster';
import os from 'os';

class ServerOptimizer {
  constructor() {
    this.cpuCount = os.cpus().length;
    this.memoryUsage = process.memoryUsage();
    this.startTime = Date.now();
  }

  // 集群模式
  enableClustering() {
    if (cluster.isMaster) {
      console.log(`主進程 ${process.pid} 正在運行`);

      // 根據 CPU 核心數創建工作進程
      const numWorkers = Math.min(this.cpuCount, 4); // 最多 4 個工作進程
      
      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      // 監聽工作進程退出
      cluster.on('exit', (worker, code, signal) => {
        console.log(`工作進程 ${worker.process.pid} 退出，代碼: ${code}, 信號: ${signal}`);
        
        if (!worker.exitedAfterDisconnect) {
          console.log('啟動新的工作進程');
          cluster.fork();
        }
      });

      // 優雅關閉
      process.on('SIGTERM', () => {
        console.log('收到 SIGTERM，關閉所有工作進程');
        
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }
      });

    } else {
      // 工作進程
      console.log(`工作進程 ${process.pid} 正在運行`);
      
      // 啟動服務器
      this.startServer();
    }
  }

  // 啟動服務器
  startServer() {
    const express = require('express');
    const app = express();

    // 應用優化中間件
    this.applyOptimizations(app);

    // 啟動服務器
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`服務器在端口 ${port} 上運行`);
    });
  }

  // 應用優化
  applyOptimizations(app) {
    // 設置信任代理
    app.set('trust proxy', 1);

    // 啟用壓縮
    const compression = require('compression');
    app.use(compression());

    // 安全頭部
    const helmet = require('helmet');
    app.use(helmet());

    // 請求大小限制
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 靜態文件緩存
    app.use(express.static('public', {
      maxAge: '1d',
      etag: true,
      lastModified: true
    }));
  }

  // 內存優化
  optimizeMemory() {
    // 設置最大內存使用
    const maxMemory = 512 * 1024 * 1024; // 512MB
    
    setInterval(() => {
      const memUsage = process.memoryUsage();
      
      if (memUsage.heapUsed > maxMemory) {
        console.warn('內存使用過高，觸發垃圾回收');
        if (global.gc) {
          global.gc();
        }
      }
    }, 30000); // 每30秒檢查一次
  }

  // 進程監控
  monitorProcess() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      console.log(`進程監控 - 內存: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB, 運行時間: ${Math.round(uptime)}s`);
    }, 60000); // 每分鐘記錄一次
  }

  // 錯誤處理
  handleErrors() {
    // 未捕獲的異常
    process.on('uncaughtException', (err) => {
      console.error('未捕獲的異常:', err);
      process.exit(1);
    });

    // 未處理的 Promise 拒絕
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未處理的 Promise 拒絕:', reason);
      process.exit(1);
    });

    // 優雅關閉
    process.on('SIGTERM', () => {
      console.log('收到 SIGTERM，開始優雅關閉');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('收到 SIGINT，開始優雅關閉');
      process.exit(0);
    });
  }

  // 性能監控
  monitorPerformance() {
    const startTime = Date.now();
    
    setInterval(() => {
      const uptime = Date.now() - startTime;
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const performanceData = {
        uptime,
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      };

      console.log('性能監控:', JSON.stringify(performanceData));
    }, 300000); // 每5分鐘記錄一次
  }

  // 負載均衡配置
  getLoadBalancerConfig() {
    return {
      // Nginx 配置
      nginx: {
        upstream: {
          servers: [
            'localhost:3000',
            'localhost:3001',
            'localhost:3002',
            'localhost:3003'
          ],
          method: 'least_conn',
          keepalive: 32
        },
        server: {
          listen: 80,
          location: {
            proxy_pass: 'http://backend',
            proxy_set_header: [
              'Host $host',
              'X-Real-IP $remote_addr',
              'X-Forwarded-For $proxy_add_x_forwarded_for',
              'X-Forwarded-Proto $scheme'
            ],
            proxy_cache: 'api_cache',
            proxy_cache_valid: '200 5m',
            proxy_cache_use_stale: 'error timeout invalid_header updating'
          }
        }
      }
    };
  }

  // 自動擴展配置
  getAutoScalingConfig() {
    return {
      minInstances: 2,
      maxInstances: 10,
      targetCPUUtilization: 70,
      targetMemoryUtilization: 80,
      scaleUpCooldown: 300, // 5分鐘
      scaleDownCooldown: 600 // 10分鐘
    };
  }

  // 健康檢查端點
  createHealthCheck() {
    return (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        version: process.version,
        platform: process.platform
      };

      res.json(health);
    };
  }
}

export default ServerOptimizer;
