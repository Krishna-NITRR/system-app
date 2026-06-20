import sys
from PIL import Image, ImageDraw, ImageFont

img_path = r"C:\Users\krish_wq7qnor\.gemini\antigravity-ide\brain\8a06d2c4-9b80-4a8f-a171-71f2d492325a\og_image_wide_1781977701914.png"
out_path = r"d:\app\APP\public\og-image.png"

try:
    img = Image.open(img_path)
    
    # Target dimensions: 1200x630
    target_width, target_height = 1200, 630
    
    # We will resize the image to cover 1200x630 (aspect fill)
    img_ratio = img.width / img.height
    target_ratio = target_width / target_height
    
    if img_ratio > target_ratio:
        # Image is wider than target. Scale to target_height and crop width.
        new_h = target_height
        new_w = int(new_h * img_ratio)
    else:
        # Image is taller than target. Scale to target_width and crop height.
        new_w = target_width
        new_h = int(new_w / img_ratio)
        
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Crop to center
    left = (new_w - target_width) / 2
    top = (new_h - target_height) / 2
    right = (new_w + target_width) / 2
    bottom = (new_h + target_height) / 2
    
    img = img.crop((left, top, right, bottom))
    
    # Draw a clear CTA button at the bottom center
    draw = ImageDraw.Draw(img)
    
    btn_w, btn_h = 240, 60
    btn_x = (target_width - btn_w) / 2
    btn_y = target_height - btn_h - 40 # 40px padding from bottom
    
    # Draw rounded rectangle for CTA button
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=30, fill="#6C4CF1")
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
        
    text = "Get the Guide"
    
    # Use textbbox to center text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    text_x = btn_x + (btn_w - tw) / 2
    text_y = btn_y + (btn_h - th) / 2 - 2 
    
    draw.text((text_x, text_y), text, fill="white", font=font)
    
    img.save(out_path)
    print("Image processed successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
