import React, { useState, useEffect } from 'react';
import { TrainingJob, AIModel } from '../types';

const AITraining: React.FC = () => {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    modelId: '',
    dataset: {
      training: 10000,
      validation: 2000,
      test: 1000
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockModels: AIModel[] = [
        {
          id: '1',
          name: 'Card Recognition v2.1',
          type: 'card_recognition',
          version: '2.1.0',
          accuracy: 95.8,
          status: 'active',
          lastUpdated: new Date().toISOString(),
          trainingData: 50000,
          performance: {
            precision: 0.958,
            recall: 0.945,
            f1Score: 0.951
          }
        },
        {
          id: '2',
          name: 'Price Predictor v1.5',
          type: 'price_prediction',
          version: '1.5.2',
          accuracy: 87.3,
          status: 'active',
          lastUpdated: new Date().toISOString(),
          trainingData: 100000,
          performance: {
            precision: 0.873,
            recall: 0.861,
            f1Score: 0.867
          }
        }
      ];

      const mockTrainingJobs: TrainingJob[] = [
        {
          id: '1',
          modelId: '1',
          modelName: 'Card Recognition v2.1',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          dataset: {
            training: 45000,
            validation: 5000,
            test: 5000
          },
          metrics: {
            loss: 0.045,
            accuracy: 0.956,
            validationAccuracy: 0.952
          }
        },
        {
          id: '2',
          modelId: '2',
          modelName: 'Price Predictor v1.5',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 3600000).toISOString(),
          dataset: {
            training: 80000,
            validation: 10000,
            test: 10000
          },
          metrics: {
            loss: 0.123,
            accuracy: 0.873,
            validationAccuracy: 0.861
          }
        }
      ];

      setModels(mockModels);
      setTrainingJobs(mockTrainingJobs);
      setLoading(false);
    };

    loadData();
  }, []);

  const startTraining = () => {
    if (!newJob.modelId) {
      alert('請選擇要訓練的模型');
      return;
    }

    const selectedModel = models.find(m => m.id === newJob.modelId);
    if (!selectedModel) return;

    const job: TrainingJob = {
      id: Date.now().toString(),
      modelId: newJob.modelId,
      modelName: selectedModel.name,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      dataset: newJob.dataset,
      metrics: {
        loss: 0,
        accuracy: 0,
        validationAccuracy: 0
      }
    };

    setTrainingJobs([job, ...trainingJobs]);
    setNewJob({
      modelId: '',
      dataset: {
        training: 10000,
        validation: 2000,
        test: 1000
      }
    });
    setShowCreateForm(false);

    // 模擬訓練過程
    simulateTraining(job.id);
  };

  const simulateTraining = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setTrainingJobs(prev =>
          prev.map(job =>
            (job.id === jobId
              ? {
                ...job,
                status: 'completed',
                progress: 100,
                endTime: new Date().toISOString(),
                metrics: {
                  loss: 0.1 + Math.random() * 0.1,
                  accuracy: 0.85 + Math.random() * 0.1,
                  validationAccuracy: 0.83 + Math.random() * 0.1
                }
              }
              : job)
          )
        );
      } else {
        setTrainingJobs(prev =>
          prev.map(job =>
            (job.id === jobId
              ? {
                ...job,
                status: 'running',
                progress: Math.min(progress, 99),
                metrics: {
                  loss: 0.2 - (progress / 100) * 0.1,
                  accuracy: 0.7 + (progress / 100) * 0.2,
                  validationAccuracy: 0.68 + (progress / 100) * 0.18
                }
              }
              : job)
          )
        );
      }
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return '訓練中';
      case 'completed': return '已完成';
      case 'failed': return '失敗';
      case 'pending': return '等待中';
      default: return status;
    }
  };

  if (loading) {
    return <div className="ai-training loading">載入訓練數據中...</div>;
  }

  return (
    <div className="ai-training">
      <div className="training-header">
        <h3>AI 模型訓練</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          開始新訓練
        </button>
      </div>

      {showCreateForm && (
        <div className="create-training-form">
          <h4>創建訓練任務</h4>
          <div className="form-group">
            <label>選擇模型:</label>
            <select
              value={newJob.modelId}
              onChange={(e) => setNewJob({...newJob, modelId: e.target.value})}
            >
              <option value="">請選擇模型</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} (v{model.version})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>訓練數據集大小:</label>
            <input
              type="number"
              value={newJob.dataset.training}
              onChange={(e) => setNewJob({
                ...newJob,
                dataset: {...newJob.dataset, training: parseInt(e.target.value)}
              })}
              placeholder="訓練數據數量"
            />
          </div>
          <div className="form-group">
            <label>驗證數據集大小:</label>
            <input
              type="number"
              value={newJob.dataset.validation}
              onChange={(e) => setNewJob({
                ...newJob,
                dataset: {...newJob.dataset, validation: parseInt(e.target.value)}
              })}
              placeholder="驗證數據數量"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={startTraining}>
              開始訓練
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="training-jobs">
        <h4>訓練任務</h4>
        <div className="jobs-list">
          {trainingJobs.map(job => (
            <div key={job.id} className="training-job-card">
              <div className="job-header">
                <h5>{job.modelName}</h5>
                <span className={`status-badge ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>

              <div className="job-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{job.progress.toFixed(1)}%</span>
              </div>

              <div className="job-metrics">
                <div className="metric">
                  <span className="metric-label">Loss:</span>
                  <span className="metric-value">{job.metrics.loss.toFixed(4)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Accuracy:</span>
                  <span className="metric-value">{(job.metrics.accuracy * 100).toFixed(2)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Val Accuracy:</span>
                  <span className="metric-value">{(job.metrics.validationAccuracy * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="job-dataset">
                <h6>數據集:</h6>
                <div className="dataset-info">
                  <span>訓練: {job.dataset.training.toLocaleString()}</span>
                  <span>驗證: {job.dataset.validation.toLocaleString()}</span>
                  <span>測試: {job.dataset.test.toLocaleString()}</span>
                </div>
              </div>

              <div className="job-meta">
                <span>開始時間: {new Date(job.startTime).toLocaleString()}</span>
                {job.endTime && (
                  <span>結束時間: {new Date(job.endTime).toLocaleString()}</span>
                )}
              </div>

              <div className="job-actions">
                {job.status === 'running' && (
                  <button className="btn btn-warning">停止訓練</button>
                )}
                {job.status === 'completed' && (
                  <button className="btn btn-success">部署模型</button>
                )}
                <button className="btn btn-primary">查看詳情</button>
                <button className="btn btn-secondary">查看日誌</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {trainingJobs.length === 0 && (
        <div className="no-jobs">
          <p>目前沒有訓練任務</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            創建第一個訓練任務
          </button>
        </div>
      )}
    </div>
  );
};

export default AITraining;
