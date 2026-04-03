const { spawn } = require("child_process");
const path = require("path");

async function isImageSafe(imagePath) {
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
        if (!Array.isArray(result)) {
          return resolve(false);
        }

        const unsafeLabels = [
          "FEMALE_BREAST_EXPOSED",
          "FEMALE_BREAST_COVERED",
          "FEMALE_GENITALIA_EXPOSED",
          "MALE_GENITALIA_EXPOSED",
          "ANUS_EXPOSED",
          "BUTTOCKS_EXPOSED",
        ];

        const unsafe = result.some(
          (item) => unsafeLabels.includes(item.class) && item.score >= 0.25,
        );

        resolve(!unsafe);
      } catch {
        resolve(false); // block on parse error
      }
    });
  });
}

module.exports = isImageSafe;
