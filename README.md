# AgriFusion_AI
# TomatoGuard AI (AgriGuard)
### Multimodal Crop Health & Microclimate Decision Engine
**Smart India Hackathon 2026 | Problem Statement ID: SIH26180 | Team ID: G12**

TomatoGuard AI bridges deep-learning visual inference with real-time agro-meteorological microclimate telemetry to eliminate false-positive diagnoses and prevent unscientific pesticide applications across tomato farming clusters.

---

## The Core Field Innovation

Standard smart-farming vision tools suffer from severe diagnostic ambiguity in real-world settings:
* **Early Blight (*Alternaria solani*)** and **Late Blight (*Phytophthora infestans*)** exhibit nearly indistinguishable necrotic lesions to computer vision models during preliminary stages.
* Biologically, their favorable microclimates are polar opposites:
  * **Early Blight:** Warm canopy temperatures ($24^\circ\text{C} - 29^\circ\text{C}$) with intermittent leaf wetness.
  * **Late Blight:** Cool temperatures ($12^\circ\text{C} - 20^\circ\text{C}$) paired with sustained canopy humidity ($>90\%$).
  * **Tomato Leaf Curl Virus (ToLCV):** High thermal regimes ($28^\circ\text{C} - 35^\circ\text{C}$) and low humidity driving whitefly vector dispersion.

TomatoGuard AI applies a **3-Layer Multimodal Decision Pipeline**:
1. **Edge Visual Inference:** Extracts morphological lesion patterns and deep feature maps using lightweight MobileNetV2.
2. **Microclimate Favorability Modeling:** Ingests live canopy temperature, relative humidity, and soil moisture alongside 15-day block meteorological trends (Open-Meteo / IMD) to compute epidemiological risk (TOMCAST logic).
3. **Multimodal Gating:**
   * **Corroborated Signals ($\ge 85\%$):** Triggers an auto-confirmed diagnosis and provides an Integrated Pest Management (IPM) advisory (irrigation delays, cultural pruning, safe pre-harvest chemical intervals).
   * **Conflicting Signals ($< 85\%$):** Intercepts automated pesticide spray guidance and flags the case to local Krishi Vigyan Kendra (KVK) plant pathologists with attached sensor telemetry.

---

## System Architecture

```text
  [ Smartphone / Camera Capture ]      [ Field IoT Sensors / Weather API ]
                 │                                      │
                 ▼                                      ▼
       MobileNetV2 Visual Engine              Microclimate Risk Engine
       - Lesion Segmentation                  - Canopy Temp & Humidity Index
       - Severity Metric (% Leaf Area)        - Soil Moisture Validation
                 │                                      │
                 └──────────────────┬───────────────────┘
                                    ▼
                      Multimodal Decision Gate
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
   [ Corroborated Evidence ]                       [ Divergent Signals ]
   Status: AUTO_CONFIRMED                          Status: FLAGGED_FOR_KVK_REVIEW
   - IPM Cultural Action Plan                      - Intercepts Spray Advisory
   - Safe Chemical Windows (PHI)                   - Dispatches Case to Extension Officer
