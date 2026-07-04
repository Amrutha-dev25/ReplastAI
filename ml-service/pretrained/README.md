# Pretrained Backbones for Replast Material Sorting

This folder represents the weight registry for the Computer Vision sorting model.

### Configured Models
- **EfficientNetV2-S**: Fast training, lightweight, optimal performance on industrial plastic sorting lines.
- **ConvNeXt-Tiny**: Excellent feature extraction, zero-shot robust shape and color categorization.

### Future Model Fine-Tuning Instructions
1. Run dataset preparation script with custom industrial sorting annotations in COCO format.
2. Augment images using Albumentations (geometric flips, color jitter, blur, and random crops).
3. Fine-tune weights on PyTorch with cross-entropy loss and AdamW optimizer.
4. Export calibrated weights to ONNX format or save as state-dict file `replast_backbone.pth` inside this folder.
