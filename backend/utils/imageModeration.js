const { spawn } = require("child_process");
const path = require("path");

// ─── NUDITY CHECK (existing) ──────────────────────────────────────────────────

function checkNudity(imagePath) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "../moderate_image.py");
    const py = spawn("python", [scriptPath, imagePath]);

    let output = "";
    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.on("close", () => {
      try {
        const result = JSON.parse(output);

        // FAIL SAFE
        if (!Array.isArray(result))
          return resolve({
            safe: false,
            reason: "Nudity check failed (invalid response)",
          });

        const unsafeLabels = [
          "FEMALE_BREAST_EXPOSED",
          "FEMALE_GENITALIA_EXPOSED",
          "MALE_GENITALIA_EXPOSED",
          "ANUS_EXPOSED",
          "BUTTOCKS_EXPOSED",
        ];

        const unsafe = result.some(
          (item) => unsafeLabels.includes(item.class) && item.score >= 0.25,
        );

        resolve(
          unsafe
            ? { safe: false, reason: "Inappropriate nudity detected" }
            : { safe: true },
        );
      } catch {
        resolve({ safe: false, reason: "Nudity check failed (parse error)" });
      }
    });
  });
}

// ─── HARMFUL CONTENT CHECK (new) ─────────────────────────────────────────────

function checkHarmful(imagePath) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "../moderate_harmful.py");
    const py = spawn("python", [scriptPath, imagePath]);

    let output = "";
    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.on("close", () => {
      try {
        const result = JSON.parse(output);

        if (typeof result.safe !== "boolean") {
          return resolve({
            safe: false,
            reason: "Harmful content check failed (invalid response)",
          });
        }

        if (!result.safe) {
          // Build a human-readable reason from flagged detections
          const flagged = (result.detections || [])
            .filter((d) => d.flagged)
            .map((d) => d.category);

          const unique = [...new Set(flagged)];
          const reason = `Harmful content detected: ${unique.join(", ")}`;
          return resolve({ safe: false, reason });
        }

        resolve({ safe: true });
      } catch {
        resolve({
          safe: false,
          reason: "Harmful content check failed (parse error)",
        });
      }
    });
  });
}

// ─── COMBINED CHECK ───────────────────────────────────────────────────────────

/**
 * Returns { safe: boolean, reason?: string }
 * Runs nudity and harmful content checks in parallel.
 */
async function checkImage(imagePath) {
  const [nudity, harmful] = await Promise.all([
    checkNudity(imagePath),
    checkHarmful(imagePath),
  ]);

  if (!nudity.safe) return { safe: false, reason: nudity.reason };
  if (!harmful.safe) return { safe: false, reason: harmful.reason };

  return { safe: true };
}

// ─── LEGACY EXPORT (backwards compatible) ────────────────────────────────────

/**
 * isImageSafe(imagePath) → boolean
 * Drop-in replacement for the old API — reviewsController.js needs no changes.
 */
async function isImageSafe(imagePath) {
  const result = await checkImage(imagePath);
  return result.safe;
}

// Optional: export the richer API for future use
isImageSafe.checkImage = checkImage;

module.exports = isImageSafe;
