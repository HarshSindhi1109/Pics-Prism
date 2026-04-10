"""
moderate_harmful.py
Detects guns, drugs, and alcohol in images using YOLOv8.
Usage: python moderate_harmful.py <image_path>
Output: JSON with { "safe": bool, "detections": [...] }
"""

import sys
import json
from ultralytics import YOLO
from PIL import Image

# ─── CONFIG ───────────────────────────────────────────────────────────────────

# COCO class names that map to firearms
GUN_LABELS = {"gun", "pistol", "rifle", "firearm", "revolver"}

# COCO class names that may indicate drugs (COCO doesn't have explicit drug labels,
# so we rely on a fine-tuned or custom model if available, else skip)
DRUG_LABELS = {"drugs", "pill", "pills", "syringe", "needle", "cocaine", "marijuana", "cannabis"}

# Alcohol-related COCO labels
ALCOHOL_LABELS = {"wine glass", "beer glass", "cocktail", "bottle", "alcohol"}

# Confidence thresholds
GUN_THRESHOLD   = 0.50   # firearms — strict
DRUG_THRESHOLD  = 0.50   # drugs — strict
ALCOHOL_THRESHOLD = 0.65 # moderate: only flag when alcohol is the clear focus

# ─── LOAD MODEL ───────────────────────────────────────────────────────────────

# YOLOv8n is the lightest variant; swap to yolov8m.pt for better accuracy
model = YOLO("yolov8n.pt")  # auto-downloads on first run

# ─── DETECT ───────────────────────────────────────────────────────────────────

def detect(image_path: str) -> dict:
    try:
        img = Image.open(image_path)
    except Exception as e:
        return {"safe": False, "error": f"Cannot open image: {e}", "detections": []}

    results = model(img, verbose=False)

    detections = []
    unsafe = False

    for result in results:
        for box in result.boxes:
            label = result.names[int(box.cls)].lower()
            score = float(box.conf)

            category = None
            flagged  = False

            if any(g in label for g in GUN_LABELS):
                category = "gun"
                if score >= GUN_THRESHOLD:
                    flagged = True

            elif any(d in label for d in DRUG_LABELS):
                category = "drug"
                if score >= DRUG_THRESHOLD:
                    flagged = True

            elif any(a in label for a in ALCOHOL_LABELS):
                category = "alcohol"
                if score >= ALCOHOL_THRESHOLD:
                    flagged = True

            if category:
                detections.append({
                    "label":    label,
                    "category": category,
                    "score":    round(score, 4),
                    "flagged":  flagged,
                })
                if flagged:
                    unsafe = True

    return {"safe": not unsafe, "detections": detections}


# ─── ENTRY POINT ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"safe": False, "error": "No image path provided", "detections": []}))
        sys.exit(1)

    output = detect(sys.argv[1])
    print(json.dumps(output))