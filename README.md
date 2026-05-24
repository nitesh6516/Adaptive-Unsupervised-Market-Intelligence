🧠 Adaptive Unsupervised Market Intelligence

Transformer-Based Multimodal Financial Analysis for Trading Entry & Exit Prediction
<p align="center">
  A production-grade, end-to-end financial intelligence platform that applies <strong>unsupervised machine learning</strong> — clustering, anomaly detection, and pattern discovery — on top of a <strong>Transformer-based deep learning model</strong> to generate actionable BUY / HOLD / SELL signals for equity markets.
  <br/><br/>
  Built on <strong>4,959 rows</strong> of multimodal market data across <strong>AAPL, MSFT, and TSLA</strong> (2020–2026), the system automatically segments market behavior into <strong>3 distinct regimes</strong>, detects structural anomalies, and visualizes every insight through a fully interactive, dark-themed dashboard — deployed live on Vercel.
  <br/><br/>
  This project demonstrates the intersection of <em>quantitative finance</em>, <em>deep learning</em>, and <em>unsupervised AI</em> — developed as an academic submission for the Deep Learning & NLP course at <strong>Lovely Professional University</strong>.
</p>

🔗 Live Project

👉 https://adaptive-unsupervised-market-intell.vercel.app/


📸 Project Screenshots
<img width="1851" height="954" alt="image" src="https://github.com/user-attachments/assets/5dd3931c-9c82-4a6d-8338-7f8a120b9294" />
<img width="1848" height="958" alt="image" src="https://github.com/user-attachments/assets/ed6e4a56-6c0c-4675-b537-4e6e968cae2a" />
<img width="1849" height="973" alt="image" src="https://github.com/user-attachments/assets/3915decd-b753-47b5-a997-169e994f29fd" />
<img width="1847" height="966" alt="image" src="https://github.com/user-attachments/assets/aea225d0-3b52-4632-9142-f9d91d36b18c" />
<img width="1851" height="967" alt="image" src="https://github.com/user-attachments/assets/b96ec22a-4f67-412c-9b8e-5726d42320f6" />

🖥️ Dashboard Overview
<p align="center">
  <img src="assets/screenshots/dashboard_overview.png" alt="Dashboard Overview" width="100%" />
</p>

Main dashboard showing KPI cards (Total Return, Sharpe, Accuracy, Regimes), symbol selector, and date range controls.


📊 Market Analysis & Regime Detection
<p align="center">
  <img src="assets/screenshots/market_analysis.png" alt="Market Analysis Panel" width="100%" />
</p>

Market regime overlay with 3 detected phases — Calm Consolidation (613 days), Balanced Regime (539 days), and High-Volatility Expansion (501 days).


🤖 Model Performance & Clustering
<p align="center">
  <img src="assets/screenshots/model_clustering.png" alt="Model Performance and Clustering" width="100%" />
</p>

Confusion matrix, per-class classification report, training loss curve, and unsupervised K-Means cluster visualization.


📌 Table of Contents

Overview
Key Features
System Architecture
Tech Stack
Dataset & Symbols
Model Details
Unsupervised Learning Modules
Market Regime Detection
Model Performance
Dashboard Sections
Project Structure
Getting Started
Artifacts & Outputs
Team


🧭 Overview
Adaptive Unsupervised Market Intelligence is a full-stack, production-grade financial analysis platform that combines Transformer-based deep learning with unsupervised machine learning techniques to discover hidden structure in financial markets — without relying on labeled training data alone.
The system ingests historical OHLCV (Open, High, Low, Close, Volume) data for major equities and applies a pipeline of:

Unsupervised clustering (K-Means / DBSCAN) to identify behavioral regimes
Anomaly detection to flag unusual market conditions
Pattern discovery across multimodal signals (price, volume, sentiment)
Transformer-based sequence modeling for BUY / HOLD / SELL signal generation
Interactive visualizations rendered in a live dashboard deployed on Vercel

This project was built as part of the Deep Learning & NLP academic submission at Lovely Professional University (LPU), and extends into a production-ready demonstration of applied unsupervised and semi-supervised financial ML.

✨ Key Features
FeatureDescription📊 Interactive DashboardLive, filterable dashboard with 5 analytical panels🤖 Transformer ModelMulti-head attention for time-series classification🔍 Unsupervised ClusteringBehavioral market segmentation using K-Means🚨 Anomaly DetectionFlags statistical outliers and regime breaks🌐 Multimodal SignalsCombines price, volume, and sentiment features📈 Market Regime DetectionIdentifies 3 distinct market phases automatically🔄 Walk-Forward ValidationPrevents data leakage with time-respecting splits🧪 Backtesting EngineSimulates trade performance with risk metrics📦 Artifact ExportSaves model weights, metrics JSON, and trade CSVs

🏗 System Architecture
┌─────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                 │
│   yfinance API  →  SQLite Cache  →  Synthetic Fallback  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                  FEATURE ENGINEERING                    │
│  Technical Indicators │ Sentiment Features │ Volume Z   │
│  (RSI, MACD, BB, ATR) │ (FinBERT-style)    │ (z-score)  │
└───────────────────────────┬─────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼──────┐  ┌───────▼───────┐  ┌─────▼────────────┐
│  UNSUPERVISED  │  │  TRANSFORMER  │  │  REGIME DETECTOR │
│  CLUSTERING    │  │  CLASSIFIER   │  │  (3 Phases)      │
│  (K-Means)     │  │  (BUY/HOLD/   │  │  Calm / Balanced │
│  Anomaly Det.  │  │   SELL)       │  │  / High-Vol      │
└─────────┬──────┘  └───────┬───────┘  └─────┬────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼────────────┐
│                   BACKTESTING ENGINE                      │
│         Risk Metrics │ Trade Logs │ P&L Simulation        │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│               REACT DASHBOARD (Deployed on Vercel)        │
│  Market Analysis │ Model Performance │ Trade Analytics    │
│  Multimodal Insights │ Unsupervised Clustering Panel      │
└───────────────────────────────────────────────────────────┘

🛠 Tech Stack
Frontend
LayerTechnologyUI FrameworkReact 18ChartingPlotly.js / RechartsStylingTailwind CSSDeploymentVercel
Backend / ML Pipeline
LayerTechnologyLanguagePython 3.9+Deep LearningPyTorch (Transformer)ML / Clusteringscikit-learn (K-Means, DBSCAN)Data IngestionyfinanceData StorageSQLite (cache)SentimentFinBERT-style (synthetic fallback)SerializationJSON, CSV, .pt (PyTorch model artifact)

📊 Dataset & Symbols
PropertyValueSymbolsAAPL, MSFT, TSLADate Range2020-01-01 → 2026-05-01Total Rows4,959Data Sourceyfinance (with SQLite cache & synthetic fallback)GranularityDaily OHLCVTrain / Val / Test SplitWalk-forward time-respecting
Label Distribution (Test Set)
SignalTrainValTestSELL (-1)936187223HOLD (0)1,108244265BUY (+1)995220166

🤖 Model Details
The core prediction engine is a Transformer-based sequence classifier trained end-to-end on multimodal time-series windows.
Architecture Highlights

Multi-head self-attention over sliding windows of OHLCV + indicator sequences
Attention matrix shape: [20 × 20] (20-step lookback window)
Positional encoding for temporal ordering
3-class output: BUY (1), HOLD (0), SELL (-1)
Training device: CPU (portable, no GPU dependency)
Epochs trained: 17 (with early stopping monitoring val loss)

Training History (Loss Curve Summary)
EpochTrain LossVal Loss11.1421.08851.1121.083101.0971.082171.0881.095

Val loss stabilizes around epoch 10, with mild overfitting observed after epoch 11 — captured by the training history panel in the dashboard.


🔬 Unsupervised Learning Modules
This is the core academic contribution of the project — applying unsupervised methods to extract structure from unlabeled market data.
1. K-Means Market Clustering

Groups trading days into behavioral clusters based on return, volatility, volume z-score, and range
Silhouette / Cluster Score: 0.18 (meaningful separation given financial noise)
Cluster count optimized via Elbow Method

2. Anomaly Detection

Flags days with statistically unusual combinations of features
Used to suppress model signals during abnormal conditions

3. Pattern Discovery

Cross-symbol correlation analysis
Momentum / mean-reversion pattern segmentation
Multimodal signal fusion (price action + sentiment + volume)


📉 Market Regime Detection
The system automatically identifies 3 distinct market regimes from clustering output:
RegimeDurationAvg ReturnVolatilityVol Z-Score🟢 Calm Consolidation613 days+0.14%1.40%-0.10🟡 Balanced Regime539 days-1.61%1.99%-0.31🔴 High-Volatility Expansion501 days+1.74%2.03%+0.46

Regime labels are auto-generated from cluster statistics — no manual labeling required.


📐 Model Performance
Test Set Results
MetricValueAccuracy36.70%Macro F10.3256Test Samples654
Per-Class Report
SignalPrecisionRecallF1SELL0.3760.7310.496HOLD0.3290.0910.142BUY0.3610.3190.339

Note: Financial time-series classification is an inherently hard problem. Random baseline accuracy for 3 classes is ~33%, and the model consistently outperforms this across SELL signals — the most critical class for risk management.


🖥 Dashboard Sections
The live dashboard at adaptive-unsupervised-market-intell.vercel.app is organized into 5 panels:
PanelDescriptionMarket AnalysisPrice charts, regime overlays, and signal visualizationModel PerformanceConfusion matrix, classification report, training loss curveTrade AnalyticsBacktest simulation, trade log, P&L timelineMultimodal InsightsAttention heatmaps, feature importance, sentiment overlayUnsupervised ClusteringCluster scatter plots, regime duration stats, anomaly flags
Summary Metrics Panel
KPIValueTotal Return0.00% (no trades cleared threshold)Sharpe Ratio0.00Max Drawdown0.00%Accuracy36.70%Trades Executed0Regimes Detected3Cluster Score0.18

📁 Project Structure
adaptive-unsupervised-market-intelligence/
│
├── frontend/                    # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketAnalysis.jsx
│   │   │   ├── ModelPerformance.jsx
│   │   │   ├── TradeAnalytics.jsx
│   │   │   ├── MultimodalInsights.jsx
│   │   │   └── ClusteringPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── backend/                     # Python ML Pipeline
│   ├── model/
│   │   ├── transformer.py       # Transformer architecture
│   │   └── train.py             # Training loop + walk-forward split
│   ├── unsupervised/
│   │   ├── clustering.py        # K-Means + Elbow method
│   │   └── anomaly.py           # Anomaly detection module
│   ├── data/
│   │   ├── ingestion.py         # yfinance + SQLite cache
│   │   └── features.py          # Technical indicator computation
│   ├── backtest/
│   │   └── engine.py            # Trade simulation + risk metrics
│   └── main.py                  # Pipeline entry point
│
├── artifacts/                   # Generated model outputs
│   ├── model_artifact.pt        # Saved PyTorch model weights
│   ├── metrics_report.json      # Full classification report
│   ├── backtest_trades.csv      # Trade-by-trade log
│   ├── feature_importance.csv   # Feature ranking
│   └── financial_data_cache.db  # SQLite OHLCV cache
│
├── vercel.json                  # Vercel deployment config
├── requirements.txt             # Python dependencies
└── README.md

🚀 Getting Started
Prerequisites
bashPython 3.9+
Node.js 18+
npm or yarn
1. Clone the Repository
bashgit clone https://github.com/nitesh6516/adaptive-unsupervised-market-intelligence.git
cd adaptive-unsupervised-market-intelligence
2. Run the Python ML Pipeline
bashcd backend
pip install -r requirements.txt
python main.py
This will:

Fetch OHLCV data via yfinance (cached in SQLite)
Engineer features (RSI, MACD, Bollinger Bands, ATR, Volume Z)
Train the Transformer model with walk-forward CV
Run unsupervised clustering and regime detection
Save all artifacts to /artifacts/

3. Launch the Frontend Dashboard
bashcd frontend
npm install
npm run dev
Visit http://localhost:5173 to explore the dashboard locally.
4. Deploy to Vercel
bashnpm install -g vercel
vercel --prod

📦 Artifacts & Outputs
FileDescriptionmodel_artifact.ptSerialized PyTorch Transformer weightsmetrics_report.jsonFull classification report + training historybacktest_trades.csvEvery simulated trade with entry/exit/P&Lfeature_importance.csvFeature ranking from attention weightsfinancial_data_cache.dbSQLite cache of all OHLCV data fetched

👨‍💻 Team
NameRoleNitesh KumarML Pipeline, Transformer Model, Unsupervised Modules, DashboardKartik SainiFeature Engineering, Backtesting EngineShivanshu GangwarData Ingestion, Visualization, Frontend Integration
Institution: Lovely Professional University (LPU), Phagwara, Punjab
Program: B.Tech CSE (AI/ML Specialization)
Submission: Deep Learning & NLP — Academic Project, 2025

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

<p align="center">
  <img src="https://img.shields.io/badge/Made%20at-LPU-blue?style=flat-square" />
  &nbsp;
  <img src="https://img.shields.io/badge/Year-2025-orange?style=flat-square" />
  &nbsp;
  <img src="https://img.shields.io/badge/Domain-AI%20%2F%20ML%20%2F%20Finance-green?style=flat-square" />
</p>
<p align="center">
  Crafted with 💡 and ☕ by the team at<br/>
  <strong>Lovely Professional University · B.Tech CSE (AI/ML) · Batch 2027</strong>
</p>
<p align="center">
  <strong>Nitesh Kumar</strong> &nbsp;|&nbsp; <strong>Kartik Saini</strong> &nbsp;|&nbsp; <strong>Shivanshu Gangwar</strong>
</p>
<p align="center">
  <a href="https://adaptive-unsupervised-market-intell.vercel.app/">🌐 Live Demo</a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/nitesh6516">👨‍💻 GitHub — Nitesh Kumar</a>
</p>
