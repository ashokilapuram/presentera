"""
Scaling utility for converting PowerPoint coordinates to Presentera canvas coordinates.

PowerPoint slides are typically 720×405 points (16:9 aspect ratio).
Presentera canvas is 1024×576 pixels (16:9 aspect ratio).

Scale factor = 1024/720 = 576/405 = 1.4222222
"""
from typing import Dict, Any, Optional


# Presentera canvas dimensions (from KonvaCanvas.js)
PRESENTERA_CANVAS_WIDTH = 1024
PRESENTERA_CANVAS_HEIGHT = 576

# Default PowerPoint slide dimensions (16:9 standard)
DEFAULT_PPT_WIDTH = 720  # points
DEFAULT_PPT_HEIGHT = 405  # points


def emu_to_points(emu: int) -> float:
    """
    Convert EMU (English Metric Units) to points.
    1 inch = 914400 EMU = 72 points
    """
    return (emu / 914400) * 72


def calculate_scale_factor(ppt_width: float, ppt_height: float) -> tuple:
    """
    Calculate scale factors for converting PPT coordinates to Presentera canvas.
    
    Args:
        ppt_width: PowerPoint slide width in points
        ppt_height: PowerPoint slide height in points
    
    Returns:
        Tuple of (scale_x, scale_y) factors
    """
    scale_x = PRESENTERA_CANVAS_WIDTH / ppt_width
    scale_y = PRESENTERA_CANVAS_HEIGHT / ppt_height
    return (scale_x, scale_y)


def scale_element_coordinates(
    element: Dict[str, Any],
    scale_x: float,
    scale_y: float
) -> Dict[str, Any]:
    """
    Scale all coordinate and size properties of an element.
    
    This function scales:
    - x, y (position)
    - width, height (dimensions)
    - fontSize (text size)
    - borderWidth (shape border)
    - Any other size-related numeric properties
    
    Args:
        element: Element dictionary (text, shape, image, chart)
        scale_x: Horizontal scale factor
        scale_y: Vertical scale factor (usually same as scale_x for 16:9)
    
    Returns:
        New element dictionary with scaled coordinates
    """
    # Create a copy to avoid modifying the original
    scaled_element = element.copy()
    
    # Scale position coordinates and round to nearest integer
    if 'x' in scaled_element and isinstance(scaled_element['x'], (int, float)):
        scaled_element['x'] = round(scaled_element['x'] * scale_x)
    
    if 'y' in scaled_element and isinstance(scaled_element['y'], (int, float)):
        scaled_element['y'] = round(scaled_element['y'] * scale_y)
    
    # Scale dimensions and round to nearest integer
    if 'width' in scaled_element and isinstance(scaled_element['width'], (int, float)):
        scaled_element['width'] = round(scaled_element['width'] * scale_x)
    
    if 'height' in scaled_element and isinstance(scaled_element['height'], (int, float)):
        scaled_element['height'] = round(scaled_element['height'] * scale_y)
    
    # Scale font size (text elements) and round to nearest integer
    if 'fontSize' in scaled_element and isinstance(scaled_element['fontSize'], (int, float)):
        scaled_element['fontSize'] = round(scaled_element['fontSize'] * scale_x)
    
    # Scale border width (shape elements) and round to nearest integer
    if 'borderWidth' in scaled_element and isinstance(scaled_element['borderWidth'], (int, float)):
        scaled_element['borderWidth'] = round(scaled_element['borderWidth'] * scale_x)
    
    # Scale any other size-related properties that might exist and round to nearest integer
    # (lineHeight, letterSpacing, padding, etc.)
    size_properties = ['lineHeight', 'letterSpacing', 'padding', 'margin', 'cellWidth', 'cellHeight']
    for prop in size_properties:
        if prop in scaled_element and isinstance(scaled_element[prop], (int, float)):
            scaled_element[prop] = round(scaled_element[prop] * scale_x)
    
    return scaled_element


def get_slide_dimensions(presentation) -> tuple:
    """
    Get PowerPoint slide dimensions in points.
    
    Args:
        presentation: python-pptx Presentation object
    
    Returns:
        Tuple of (width, height) in points
    """
    try:
        # Get slide dimensions from presentation
        slide_width_emu = presentation.slide_width
        slide_height_emu = presentation.slide_height
        
        # Convert EMU to points
        width_pt = emu_to_points(slide_width_emu)
        height_pt = emu_to_points(slide_height_emu)
        
        return (width_pt, height_pt)
    except Exception:
        # Fallback to default dimensions if extraction fails
        return (DEFAULT_PPT_WIDTH, DEFAULT_PPT_HEIGHT)

