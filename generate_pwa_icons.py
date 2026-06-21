import sys
from PIL import Image

try:
    img_path = r"d:\app\APP\public\og-image.png"
    img = Image.open(img_path)
    
    # Crop to center square
    min_dim = min(img.width, img.height)
    left = (img.width - min_dim) / 2
    top = (img.height - min_dim) / 2
    right = (img.width + min_dim) / 2
    bottom = (img.height + min_dim) / 2
    
    img_sq = img.crop((left, top, right, bottom))
    
    img_192 = img_sq.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(r"d:\app\APP\public\pwa-192x192.png")
    
    img_512 = img_sq.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(r"d:\app\APP\public\pwa-512x512.png")
    
    # Apple touch icon (180x180)
    img_180 = img_sq.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(r"d:\app\APP\public\apple-touch-icon.png")

    print("Icons generated successfully!")
except Exception as e:
    print(f"Error: {e}")
