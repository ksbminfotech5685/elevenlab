import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const ASTROTALK_API_KEY = "eb45cb1f-d421-4cd5-9517-f4dcace515ed";
const BASE_URL = "https://kundli2.astrosetalk.com/api";

// -------------------------------------------
// COMBO API — Kundli Summary + Prediction
// -------------------------------------------
app.post("/api/kundli_full", async (req, res) => {
  try {
    const {
      name,
      gender = "male",
      day,
      month,
      year,
      hour,
      min,
      place,
      latitude,
      longitude,
      question = "general prediction"
    } = req.body;

    // 🪐 1️⃣ Step 1 — Call AstroTalk Birth Data API
    const birthPayload = {
      name,
      gender,
      day,
      month,
      year,
      hour,
      min,
      place,
      latitude,
      longitude,
      timezone: "5.5"
    };

    const birthRes = await axios.post(
      `${BASE_URL}/astro/get_birth_data`,
      birthPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ASTROTALK_API_KEY
        }
      }
    );

    if (!birthRes.data.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch birth data",
        astroResponse: birthRes.data
      });
    }

    // 🌟 2️⃣ Step 2 — Call AstroTalk Prediction API using same details
    const predictionPayload = {
      name,
      gender,
      day,
      month,
      year,
      hour,
      min,
      place,
      latitude,
      longitude,
      timezone: "5.5",
      question
    };

    const predictionRes = await axios.post(
      `${BASE_URL}/prediction/get_prediction`,
      predictionPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ASTROTALK_API_KEY
        }
      }
    );

    // 🎯 3️⃣ Merge both results
    return res.json({
      success: true,
      message: "Kundli summary and prediction fetched successfully",
      kundli_summary: birthRes.data,
      kundli_prediction: predictionRes.data
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.response?.data || error.message
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("🚀 AstroOne Kundli Full API is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
