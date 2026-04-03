from nudenet import NudeDetector
import sys
import json

image_path = sys.argv[1]

detector = NudeDetector()
result = detector.detect(image_path)

print(json.dumps(result))
