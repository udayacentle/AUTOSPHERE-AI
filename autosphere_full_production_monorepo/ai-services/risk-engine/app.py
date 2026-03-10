
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()
model = joblib.load("risk_model.pkl")

@app.post("/calculate-risk")
def calculate_risk(features: list[float]):
    prediction = model.predict([features])
    return {"risk_score": float(prediction[0])}
