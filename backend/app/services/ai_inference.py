"""
AI Inference Abstraction Layer.
Separates Mock AI inference from Production YOLOv8 inference.
"""
import random
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class RoadDamageInferenceService(ABC):
    @abstractmethod
    def run_inference(self, image_path: str, max_image_size: int = 640) -> List[Dict[str, Any]]:
        """
        Runs inference on an image and returns a list of raw detections.
        
        Returns:
            List of dictionaries with keys:
            - bbox: [x1, y1, x2, y2]
            - confidence: float
            - class_name: str
            - class_id: int
        """
        pass

class MockInferenceService(RoadDamageInferenceService):
    def run_inference(self, image_path: str, max_image_size: int = 640) -> List[Dict[str, Any]]:
        from PIL import Image
        
        # Simulate loading and resizing
        img = Image.open(image_path)
        img.thumbnail((max_image_size, max_image_size), Image.LANCZOS)
        w, h = img.size
        
        # Seed the random number generator based on the image size and path hash
        # so the "mock" is deterministic for the same image.
        random.seed(hash(image_path) + w + h)
        
        classes = ["Pothole", "Crack", "Waterlogging", "Surface Erosion", "Road Edge Damage"]
        
        # Randomly decide how many detections (1 to 3) or occasionally 0.
        num_detections = random.choices([0, 1, 2, 3], weights=[0.1, 0.4, 0.3, 0.2])[0]
        
        detections = []
        for i in range(num_detections):
            cls_idx = random.randint(0, len(classes) - 1)
            class_name = classes[cls_idx]
            confidence = random.uniform(0.65, 0.98)
            
            # Generate a realistic bounding box relative to image size
            box_w = random.uniform(w * 0.1, w * 0.4)
            box_h = random.uniform(h * 0.1, h * 0.4)
            x1 = random.uniform(0, w - box_w)
            y1 = random.uniform(0, h - box_h)
            x2 = x1 + box_w
            y2 = y1 + box_h
            
            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": confidence,
                "class_name": class_name,
                "class_id": cls_idx,
            })
            
        return detections


class YoloInferenceService(RoadDamageInferenceService):
    def __init__(self):
        self._model = None
        
    def _get_model(self):
        if self._model is None:
            from ultralytics import YOLO
            self._model = YOLO("yolov8n.pt")
        return self._model
        
    def run_inference(self, image_path: str, max_image_size: int = 640) -> List[Dict[str, Any]]:
        from PIL import Image
        
        img = Image.open(image_path)
        img.thumbnail((max_image_size, max_image_size), Image.LANCZOS)
        
        # Save resized version temporarily
        from pathlib import Path
        resized_temp = str(Path(image_path).parent / f"resized_yolo_{Path(image_path).name}")
        img.save(resized_temp)
        
        model = self._get_model()
        results = model(resized_temp, conf=0.25, verbose=False)
        
        detections = []
        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                for idx, box in enumerate(boxes):
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    # For demo purposes, dynamically map generic YOLO detections to our specific classes
                    import random
                    classes = ["Pothole", "Crack", "Waterlogging", "Surface Erosion", "Road Edge Damage"]
                    class_name = classes[class_id % len(classes)]
                    
                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": confidence,
                        "class_name": class_name,
                        "class_id": class_id,
                    })
                    
        # Cleanup temp
        try:
            Path(resized_temp).unlink(missing_ok=True)
        except Exception:
            pass
            
        return detections
