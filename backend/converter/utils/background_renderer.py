"""
Background Renderer - Converts all PPT background types to PNG images.
Flattens solid, gradient, image, and pattern backgrounds into base64 PNG.
"""
from PIL import Image, ImageDraw
import base64
from io import BytesIO
from typing import Optional, Dict, Any, List, Tuple


# Standard slide dimensions for rendering (1920x1080 for high quality)
SLIDE_W = 1920
SLIDE_H = 1080


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    elif len(hex_color) == 3:
        return tuple(int(hex_color[i]*2, 16) for i in range(3))
    return (255, 255, 255)  # Default white


def new_canvas() -> Tuple[Image.Image, ImageDraw.ImageDraw]:
    """Create a new transparent canvas."""
    img = Image.new("RGBA", (SLIDE_W, SLIDE_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    return img, draw


def render_solid_background(color_hex: str) -> Image.Image:
    """Render solid color background."""
    img, draw = new_canvas()
    rgb = hex_to_rgb(color_hex)
    draw.rectangle([0, 0, SLIDE_W, SLIDE_H], fill=rgb)
    return img


def render_image_background(image_bytes: bytes) -> Image.Image:
    """
    Render image background with COVER behavior (like PowerPoint).
    
    Scales image to cover entire slide, maintaining aspect ratio, then crops to fit.
    """
    img, draw = new_canvas()
    try:
        bg = Image.open(BytesIO(image_bytes)).convert("RGBA")
        
        # COVER LOGIC: Scale to cover entire slide (like CSS background-size: cover)
        # Calculate scale ratio to ensure image covers both width and height
        ratio = max(SLIDE_W / bg.width, SLIDE_H / bg.height)
        new_w = int(bg.width * ratio)
        new_h = int(bg.height * ratio)
        
        # Resize image to cover dimensions
        bg = bg.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Center crop to exact slide dimensions
        x = (new_w - SLIDE_W) // 2
        y = (new_h - SLIDE_H) // 2
        cropped_bg = bg.crop((x, y, x + SLIDE_W, y + SLIDE_H))
        
        # Paste the cropped image onto canvas
        img.paste(cropped_bg, (0, 0))
    except Exception:
        # If image loading fails, use white background
        draw.rectangle([0, 0, SLIDE_W, SLIDE_H], fill=(255, 255, 255, 255))
    return img


def render_linear_gradient(stops: List[Dict[str, Any]], angle: float = 90.0) -> Image.Image:
    """
    Render linear gradient background.
    
    Args:
        stops: List of gradient stops with 'color' (hex) and 'position' (0.0-1.0)
        angle: Gradient angle in degrees (0 = left to right, 90 = top to bottom)
    """
    img = Image.new("RGBA", (SLIDE_W, SLIDE_H))
    draw = ImageDraw.Draw(img)
    
    if not stops or len(stops) < 2:
        # Fallback to white if no stops
        draw.rectangle([0, 0, SLIDE_W, SLIDE_H], fill=(255, 255, 255, 255))
        return img
    
    # Convert angle to radians and normalize
    angle_rad = (angle * 3.14159) / 180.0
    
    # For vertical gradient (most common)
    if abs(angle - 90) < 1 or abs(angle - 270) < 1:
        # Vertical gradient (top to bottom)
        for y in range(SLIDE_H):
            t = y / SLIDE_H
            
            # Find the two stops that bracket this position
            left_stop = stops[0]
            right_stop = stops[-1]
            local_t = t
            
            for i in range(len(stops) - 1):
                if stops[i]['position'] <= t <= stops[i + 1]['position']:
                    left_stop = stops[i]
                    right_stop = stops[i + 1]
                    # Interpolate between these two stops
                    if right_stop['position'] != left_stop['position']:
                        local_t = (t - left_stop['position']) / (right_stop['position'] - left_stop['position'])
                    else:
                        local_t = 0
                    break
            
            # Interpolate colors
            left_rgb = hex_to_rgb(left_stop['color'])
            right_rgb = hex_to_rgb(right_stop['color'])
            
            r = int(left_rgb[0] + (right_rgb[0] - left_rgb[0]) * local_t)
            g = int(left_rgb[1] + (right_rgb[1] - left_rgb[1]) * local_t)
            b = int(left_rgb[2] + (right_rgb[2] - left_rgb[2]) * local_t)
            
            draw.line([(0, y), (SLIDE_W, y)], fill=(r, g, b, 255))
    else:
        # Horizontal gradient (left to right)
        for x in range(SLIDE_W):
            t = x / SLIDE_W
            
            # Find the two stops that bracket this position
            left_stop = stops[0]
            right_stop = stops[-1]
            local_t = t
            
            for i in range(len(stops) - 1):
                if stops[i]['position'] <= t <= stops[i + 1]['position']:
                    left_stop = stops[i]
                    right_stop = stops[i + 1]
                    local_t = (t - left_stop['position']) / (right_stop['position'] - left_stop['position']) if right_stop['position'] != left_stop['position'] else 0
                    break
            
            # Interpolate colors
            left_rgb = hex_to_rgb(left_stop['color'])
            right_rgb = hex_to_rgb(right_stop['color'])
            
            r = int(left_rgb[0] + (right_rgb[0] - left_rgb[0]) * local_t)
            g = int(left_rgb[1] + (right_rgb[1] - left_rgb[1]) * local_t)
            b = int(left_rgb[2] + (right_rgb[2] - left_rgb[2]) * local_t)
            
            draw.line([(x, 0), (x, SLIDE_H)], fill=(r, g, b, 255))
    
    return img


def render_pattern(pattern_type: str, fg_color: str, bg_color: str) -> Image.Image:
    """
    Render pattern background.
    
    Args:
        pattern_type: Pattern type (e.g., 'pct50', 'diagCross', 'hsStripe')
        fg_color: Foreground color (hex)
        bg_color: Background color (hex)
    """
    img, draw = new_canvas()
    fg_rgb = hex_to_rgb(fg_color)
    bg_rgb = hex_to_rgb(bg_color)
    
    # Fill with background color first
    draw.rectangle([0, 0, SLIDE_W, SLIDE_H], fill=bg_rgb)
    
    # Create pattern tile
    tile_size = 16
    tile = Image.new("RGBA", (tile_size, tile_size), bg_rgb)
    tdraw = ImageDraw.Draw(tile)
    
    # Render different pattern types
    if pattern_type in ['pct50', 'pct25', 'pct75']:
        # Percentage patterns (checkerboard-like)
        if pattern_type == 'pct50':
            tdraw.rectangle([0, 0, tile_size//2, tile_size//2], fill=fg_rgb)
            tdraw.rectangle([tile_size//2, tile_size//2, tile_size, tile_size], fill=fg_rgb)
        elif pattern_type == 'pct25':
            tdraw.rectangle([0, 0, tile_size//2, tile_size//2], fill=fg_rgb)
        elif pattern_type == 'pct75':
            tdraw.rectangle([0, 0, tile_size, tile_size], fill=fg_rgb)
            tdraw.rectangle([tile_size//2, tile_size//2, tile_size, tile_size], fill=bg_rgb)
    
    elif pattern_type in ['diagStripe', 'diagCross']:
        # Diagonal stripe
        tdraw.line([(0, tile_size), (tile_size, 0)], fill=fg_rgb, width=2)
        if pattern_type == 'diagCross':
            tdraw.line([(0, 0), (tile_size, tile_size)], fill=fg_rgb, width=2)
    
    elif pattern_type in ['hsStripe', 'horzStripe']:
        # Horizontal stripe
        tdraw.rectangle([0, tile_size//2, tile_size, tile_size], fill=fg_rgb)
    
    elif pattern_type in ['vsStripe', 'vertStripe']:
        # Vertical stripe
        tdraw.rectangle([tile_size//2, 0, tile_size, tile_size], fill=fg_rgb)
    
    else:
        # Default: simple diagonal
        tdraw.line([(0, tile_size), (tile_size, 0)], fill=fg_rgb, width=2)
    
    # Tile the pattern across the entire slide
    for y in range(0, SLIDE_H, tile_size):
        for x in range(0, SLIDE_W, tile_size):
            img.paste(tile, (x, y))
    
    return img


def to_base64_png(pil_img: Image.Image) -> str:
    """Convert PIL Image to base64 PNG data URL."""
    buf = BytesIO()
    pil_img.save(buf, format="PNG")
    base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{base64_str}"


def render_background_as_png(background_info: Dict[str, Any], pptx_path: Optional[str] = None) -> str:
    """
    Master function to render any background type as PNG.
    
    Args:
        background_info: Background information dictionary
        pptx_path: Path to PPTX file (for extracting images)
    
    Returns:
        Base64 PNG data URL string
    """
    btype = background_info.get("type", "none")
    
    # Solid background
    if btype == "solid" and background_info.get("color"):
        img = render_solid_background(background_info["color"])
        return to_base64_png(img)
    
    # Image background
    if btype == "image":
        image_bytes = background_info.get("imageBytes")
        if image_bytes:
            img = render_image_background(image_bytes)
            return to_base64_png(img)
        # Try to get from src if it's already base64
        src = background_info.get("image", {}).get("src") if isinstance(background_info.get("image"), dict) else None
        if src and src.startswith("data:image"):
            # Already a base64 image, return as is
            return src
    
    # Gradient background
    if btype == "gradient":
        gradient = background_info.get("gradient", {})
        stops = gradient.get("stops", []) if isinstance(gradient, dict) else []
        angle = gradient.get("angle", 90.0) if isinstance(gradient, dict) else 90.0
        if stops:
            img = render_linear_gradient(stops, angle)
            return to_base64_png(img)
    
    # Pattern background
    if btype == "pattern":
        pattern = background_info.get("pattern", {})
        if isinstance(pattern, dict):
            pattern_type = pattern.get("patternType", "pct50")
            fg_color = pattern.get("fgColor", "#000000")
            bg_color = pattern.get("bgColor", "#ffffff")
            img = render_pattern(pattern_type, fg_color, bg_color)
            return to_base64_png(img)
    
    # Fallback: white background
    img, draw = new_canvas()
    draw.rectangle([0, 0, SLIDE_W, SLIDE_H], fill=(255, 255, 255, 255))
    return to_base64_png(img)

