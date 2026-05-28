# Insulin Resistance Prediction API

FastAPI service with three sklearn/LightGBM models, SHAP explainability, optional FAISS RAG, and Groq LLM explanations.

## Models

| Tier | Algorithm | Features |
|------|-----------|----------|
| Basic | RandomForest | Age, Sex, BMI, Waist |
| Intermediate | RandomForest | + Glucose, Triglycerides, TyG |
| Advanced | LightGBM | + HDL, Recreational_Activity (exercise days/week), TG_HDL_ratio |

## Run locally

```bash
cd insulin_resistance_prediction-main
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # add GROQ_API_KEY (optional for ML-only)
uvicorn main:app --host 0.0.0.0 --port 8000
```

Health: `GET http://127.0.0.1:8000/health`  
Predict: `POST http://127.0.0.1:8000/predict`

## Deploy on Render

1. Push this repo to GitHub (models under `model/` are included).
2. [Render Dashboard](https://dashboard.render.com) → New → Blueprint → connect repo.
3. Set `GROQ_API_KEY` in the service environment.
4. Set `ENABLE_RAG=false` on free tier unless you need RAG (faster cold starts).
5. Copy the Render URL into the React app: `REACT_APP_API_URL=https://your-service.onrender.com`

Or from repo root run `deploy-ml-api.ps1` for local + ngrok.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | AI explanations & chat; ML works without it |
| `ENABLE_RAG` | No | `false` skips FAISS/embeddings at startup |
| `CORS_ORIGINS` | No | Comma-separated frontend URLs |
| `PORT` | No | Set by Render automatically |
