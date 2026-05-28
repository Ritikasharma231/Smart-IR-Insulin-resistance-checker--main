from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
from pydantic import BaseModel, field_validator
import numpy as np
from groq import Groq
from dotenv import load_dotenv
import os
import logging
from typing import Optional
import json

try:
    import shap
except Exception as exc:
    shap = None
    shap_import_error = exc
else:
    shap_import_error = None

app = FastAPI(title="Insulin Resistance Prediction API", version="1.1.0")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Production-ready logging with JSON formatting
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
)
logger = logging.getLogger(__name__)
if os.getenv("ENVIRONMENT", "development").lower() == "production":
    for handler in logger.handlers:
        handler.setFormatter(JSONFormatter())

# CORS: explicit origins (wildcard + credentials is invalid in browsers)
# Include development, production, and cloud-deployed URLs
_cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://sgt-university.co.in,https://project-ryvfu.vercel.app",
).split(",")
# Add support for Railway and Render cloud deployments
cloud_url = os.getenv("CLOUD_URL")
if cloud_url:
    _cors_origins.append(cloud_url)
    logger.info("Added cloud URL to CORS: %s", cloud_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS configured for origins: %s", ", ".join(o.strip() for o in _cors_origins if o.strip()))

# Groq is optional: ML /predict works without it; chat & LLM explanations degrade gracefully
_groq_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=_groq_key) if _groq_key else None
if not groq_client:
    logger.warning("GROQ_API_KEY not set — predictions work; AI explanations use templates only")

# ---------------- LOAD MODELS ----------------
MODEL_DIR = os.path.join(BASE_DIR, "model")
models = {}
explainers = {}
model_loaded = False

try:
    for model_type in ["basic", "intermediate", "advanced"]:
        model_path = os.path.join(MODEL_DIR, f"{model_type}_model.pkl")
        if not os.path.exists(model_path):
            logger.warning("Model file not found: %s", model_path)
            continue
        models[model_type] = joblib.load(model_path)
        if shap is not None:
            try:
                explainers[model_type] = shap.TreeExplainer(models[model_type])
            except Exception as exc:
                logger.warning("SHAP explainer unavailable for %s: %s", model_type, exc)
        else:
            logger.warning(
                "SHAP import failed; explanation support disabled for %s: %s",
                model_type,
                shap_import_error,
            )
        logger.info(
            "Loaded %s model (%s, %d features)",
            model_type,
            type(models[model_type]).__name__,
            models[model_type].n_features_in_,
        )
    model_loaded = len(models) == 3
    if model_loaded:
        logger.info("✓ All 3 models loaded successfully")
    else:
        logger.error("✗ Failed to load all models. Loaded: %s", list(models.keys()))
except Exception as e:
    logger.critical("CRITICAL: Error loading models on startup: %s", e)
    model_loaded = False

# Startup validation: ensure models are ready before accepting requests
if not model_loaded:
    logger.warning("⚠ WARNING: Starting in degraded mode. Some models failed to load. Check logs.")

# ---------------- RAG (lazy) ----------------
_embedding = None
_db = None
_rag_init_attempted = False


def _resolve_faiss_dir():
    for candidate in (
        os.path.join(BASE_DIR, "faiss_index"),
        BASE_DIR,
    ):
        if os.path.isfile(os.path.join(candidate, "index.faiss")) and os.path.isfile(
            os.path.join(candidate, "index.pkl")
        ):
            return candidate
    return None


def get_rag_db():
    global _embedding, _db, _rag_init_attempted
    if _db is not None:
        return _db
    if _rag_init_attempted:
        return None
    _rag_init_attempted = True
    if os.getenv("ENABLE_RAG", "true").lower() not in ("1", "true", "yes"):
        logger.info("RAG disabled via ENABLE_RAG")
        return None
    faiss_dir = _resolve_faiss_dir()
    if not faiss_dir:
        logger.warning("FAISS index not found (expected index.faiss + index.pkl)")
        return None
    try:
        from langchain_community.vectorstores import FAISS
        from langchain_huggingface import HuggingFaceEmbeddings

        _embedding = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        _db = FAISS.load_local(
            faiss_dir,
            _embedding,
            allow_dangerous_deserialization=True,
        )
        logger.info("FAISS index loaded from %s", faiss_dir)
        return _db
    except Exception as e:
        logger.error("Error loading RAG: %s", e)
        return None


def rag_loaded():
    return get_rag_db() is not None


# ---------------- INPUT SCHEMA ----------------
class PatientData(BaseModel):
    model_config = {"protected_namespaces": ()}
    model_type: str

    Age: float
    Sex: float
    BMI: float
    Waist: float

    Glucose: Optional[float] = None
    Triglycerides: Optional[float] = None
    HDL: Optional[float] = None
    Exercise: Optional[float] = None

    # Additional fields for advanced assessment (optional, not used in ML but stored)
    SystolicBP: Optional[float] = None
    DiastolicBP: Optional[float] = None
    ExerciseIntensity: Optional[str] = None
    ExerciseDuration: Optional[float] = None

    @field_validator("model_type")
    @classmethod
    def validate_model_type(cls, v):
        if v not in ("basic", "intermediate", "advanced"):
            raise ValueError("model_type must be 'basic', 'intermediate', or 'advanced'")
        return v


@app.get("/")
def home():
    return {
        "message": "Insulin Resistance Prediction API",
        "status": "healthy" if model_loaded else "degraded",
        "models_loaded": model_loaded,
        "rag_loaded": rag_loaded(),
        "groq_configured": groq_client is not None,
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model_loaded else "degraded",
        "models_loaded": model_loaded,
        "rag_loaded": rag_loaded(),
        "groq_configured": groq_client is not None,
        "available_models": list(models.keys()),
    }


def _tyg_index(glucose: float, triglycerides: float) -> float:
    return float(np.log((triglycerides * glucose) / 2.0))


def build_features(data: PatientData):
    """Build feature matrix aligned with each model's training column order."""
    model = models[data.model_type]
    names = [str(n) for n in model.feature_names_in_]

    tyg = None
    tg_hdl = None
    if data.Glucose is not None and data.Triglycerides is not None:
        tyg = _tyg_index(data.Glucose, data.Triglycerides)
    if data.Triglycerides is not None and data.HDL:
        tg_hdl = data.Triglycerides / data.HDL

    aliases = {
        "Age": data.Age,
        "Sex": data.Sex,
        "BMI": data.BMI,
        "Waist": data.Waist,
        "Glucose": data.Glucose,
        "Triglycerides": data.Triglycerides,
        "TyG": tyg,
        "TyG Index": tyg,
        "HDL": data.HDL,
        "HDL_(good_cholesterol)": data.HDL,
        "Exercise": data.Exercise,
        "Recreational_Activity": data.Exercise,
        "TG_HDL_ratio": tg_hdl,
    }

    row = []
    for name in names:
        val = aliases.get(name)
        if val is None:
            raise ValueError(f"Missing required feature value for column: {name}")
        row.append(val)

    import pandas as pd

    return pd.DataFrame([row], columns=names), names


def compute_shap_contributions(model_type: str, features, feature_names):
    explainer = explainers.get(model_type)
    if explainer is None:
        return list(zip(feature_names, [0.0] * len(feature_names)))

    shap_values = explainer(features)
    try:
        if len(shap_values.values.shape) == 3:
            values = shap_values.values[0, :, 1]
        else:
            values = shap_values.values[0]
    except Exception:
        values = np.asarray(shap_values.values).flatten()[: len(feature_names)]

    return list(zip(feature_names, values))


def generate_llm_explanation(prompt: str, risk_category: str, prob_pct: float, contributions) -> str:
    if not groq_client:
        factors = ", ".join(f[0] for f in contributions[:3])
        return (
            f"Your assessment indicates {risk_category} ({prob_pct:.1f}% estimated probability). "
            f"Key factors: {factors}. Consult a healthcare provider for personalized advice."
        )
    try:
        chat_response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical assistant explaining insulin resistance in simple terms.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        logger.error("Groq API error: %s", e)
        factors = ", ".join(f[0] for f in contributions[:3])
        return (
            f"Based on your {risk_category} status ({prob_pct:.1f}%), focus on: {factors}. "
            "Consult a healthcare provider for personalized advice."
        )


@app.post("/predict")
def predict(data: PatientData):
    try:
        if not model_loaded:
            raise HTTPException(status_code=503, detail="Models not loaded. Server is not ready.")

        if data.model_type not in models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model_type. Available: {list(models.keys())}",
            )

        model = models[data.model_type]

        if data.model_type in ("intermediate", "advanced"):
            if data.Glucose is None or data.Triglycerides is None:
                raise HTTPException(
                    status_code=400,
                    detail="Glucose and Triglycerides are required for intermediate/advanced models",
                )

        if data.model_type == "advanced":
            if data.HDL is None or data.Exercise is None:
                raise HTTPException(
                    status_code=400,
                    detail="HDL and Exercise are required for advanced model",
                )
            if data.HDL <= 0:
                raise HTTPException(status_code=400, detail="HDL must be greater than zero")

        features, feature_names = build_features(data)

        prediction = int(model.predict(features)[0])
        prob = float(model.predict_proba(features)[0][1])

        contributions = compute_shap_contributions(data.model_type, features, feature_names)
        contributions = sorted(contributions, key=lambda x: abs(x[1]), reverse=True)

        top_factors = [
            f"{name} increased risk (impact {round(float(val * 100), 3)})"
            if val > 0
            else f"{name} decreased risk (impact {round(float(val * 100), 3)})"
            for name, val in contributions[:5]
        ]

        label = "Insulin Resistant" if prediction == 1 else "Normal"
        risk_category = (
            "Low Risk" if prob < 0.31 else "Moderate Risk" if prob < 0.61 else "High Risk"
        )
        prob_pct = round(prob * 100, 2)

        result = {
            "prediction": prediction,
            "label": label,
            "risk_category": risk_category,
            "risk_probability": prob_pct,
            "top_risk_factors": top_factors,
        }

        context = ""
        db = get_rag_db()
        if db:
            try:
                keywords = " ".join(f.split()[0] for f in top_factors)
                query = f"{label} causes effects {keywords}"
                docs = db.similarity_search(query, k=2)
                context = "\n".join(doc.page_content for doc in docs)
            except Exception as e:
                logger.warning("RAG query error: %s", e)

        prompt = f"""
Patient Condition: {label}
Risk Level: {risk_category} ({prob_pct}%)

Top Risk Factors:
{", ".join(f[0] for f in contributions[:3])}

Medical Context:
{context or "Not available."}

Explain this to a non-medical person in 3-4 simple sentences.
Mention what was the major factor contributing to the outcome in their specific case.
Include causes, meaning, and what the patient should understand.
Suggest Recommendations and Lifestyle changes.
"""

        llm_output = generate_llm_explanation(prompt, risk_category, prob_pct, contributions)

        return {**result, "explanation": llm_output}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Prediction error: %s", e)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/chat")
def chat_endpoint(request: dict):
    try:
        message = request.get("message", "")
        user_context = request.get("user_context", "")

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        if not groq_client:
            return {
                "response": "AI chat is unavailable (GROQ_API_KEY not configured).",
                "status": "error",
            }

        rag_context = ""
        db = get_rag_db()
        if db:
            try:
                docs = db.similarity_search(f"Insulin resistance {message.lower()}", k=2)
                if docs:
                    rag_context = "\n\nRelevant Medical Context:\n" + "\n\n".join(
                        d.page_content for d in docs
                    )
            except Exception as e:
                logger.warning("RAG search error in chat: %s", e)

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful medical assistant specializing in insulin resistance. "
                        "Emphasize consulting healthcare professionals for medical advice."
                    ),
                },
                {
                    "role": "system",
                    "content": f"Use this medical context when relevant: {rag_context}",
                },
                {
                    "role": "user",
                    "content": f"User context: {user_context}\n\nQuestion: {message}",
                },
            ],
            max_tokens=1000,
            temperature=0.7,
        )

        return {
            "response": completion.choices[0].message.content,
            "status": "success",
            "rag_enabled": bool(rag_context),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Chat endpoint error: %s", e)
        return {
            "response": "I'm sorry, I'm having trouble connecting right now. Please try again later.",
            "status": "error",
            "error": str(e),
        }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    logger.info("Starting server on http://%s:%s", host, port)
    uvicorn.run(app, host=host, port=port, log_level="info")
