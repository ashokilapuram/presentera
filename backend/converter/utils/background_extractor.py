"""
Phase 5: Background Extraction from PPTX
Extracts slide backgrounds with full support for:
- Direct sRGB colors
- Theme/scheme colors (accent1, dk1, lt1, bg1, bg2, etc.)
- Image backgrounds (original images only, no PNG generation)
- Background inheritance from layout and master
"""
import zipfile
import xml.etree.ElementTree as ET
from typing import Optional, Dict, Any, List, Tuple
from pptx.enum.dml import MSO_FILL_TYPE


def rgb_to_hex(rgb) -> Optional[str]:
    """Convert RGB color to hex string. Returns None if color is invalid."""
    if rgb is None:
        return None
    
    # Handle different color formats
    try:
        if hasattr(rgb, 'rgb'):
            # Check if rgb property exists and is not None
            if rgb.rgb is None:
                return None
            rgb = rgb.rgb
    except (AttributeError, TypeError):
        return None
    
    if rgb is None:
        return None
    
    # Extract RGB values
    try:
        if isinstance(rgb, int):
            # Assume it's a 32-bit integer: 0x00RRGGBB
            r = (rgb >> 16) & 0xFF
            g = (rgb >> 8) & 0xFF
            b = rgb & 0xFF
        elif hasattr(rgb, '__iter__') and len(rgb) >= 3:
            r, g, b = rgb[0], rgb[1], rgb[2]
        else:
            return None
        
        return f"#{r:02x}{g:02x}{b:02x}"
    except (TypeError, ValueError, IndexError):
        return None


def get_theme_scheme_mapping(pptx_path: str) -> Dict[str, str]:
    """
    Parse theme XML to extract scheme color mappings.
    
    Handles ALL theme colors: accent1-6, bg1-2, dk1-2, lt1-2, tx1-2, sysClr.
    
    Args:
        pptx_path: Path to PPTX file (ZIP archive)
    
    Returns:
        Dictionary mapping scheme names to hex colors
    """
    mapping = {}
    
    try:
        with zipfile.ZipFile(pptx_path, 'r') as z:
            # Find theme files (usually ppt/theme/theme1.xml)
            theme_files = [f for f in z.namelist() if f.startswith("ppt/theme/")]
            
            if not theme_files:
                return mapping
            
            # Use the first theme file (usually theme1.xml)
            xml = z.read(theme_files[0]).decode("utf-8", errors="ignore")
            root = ET.fromstring(xml)
            
            # Find clrScheme element (namespace-safe)
            clr = None
            for elem in root.iter():
                tag_name = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                if tag_name == "clrScheme":
                    clr = elem
                    break
            
            if clr is None:
                return mapping
            
            # Parse each scheme color entry (accent1-6, bg1-2, dk1-2, lt1-2, tx1-2, etc.)
            for child in clr:
                name = child.tag.split("}")[-1]  # accent1, bg1, dk1, etc.
                
                # Look for color in child elements
                for sub in child:
                    tag = sub.tag.split("}")[-1]
                    
                    # Case 1: srgbClr (direct RGB)
                    if tag == "srgbClr" and "val" in sub.attrib:
                        mapping[name] = "#" + sub.attrib["val"].lower()
                        break
                    
                    # Case 2: sysClr (system color with lastClr)
                    elif tag == "sysClr" and "lastClr" in sub.attrib:
                        mapping[name] = "#" + sub.attrib["lastClr"].lower()
                        break
    
    except Exception:
        # If parsing fails, return empty mapping (fallback to direct RGB)
        pass
    
    return mapping


def detect_background_type(xml_root) -> str:
    """Detect background type from XML root."""
    for elem in xml_root.iter():
        tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
        
        if tag == "solidFill":
            return "solid"
        if tag == "gradFill":
            return "gradient"
        if tag == "blipFill":
            return "image"
        if tag == "pattFill":
            return "pattern"
    
    return "none"


def extract_color_from_element(color_elem, theme_mapping: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """Extract color from XML element. Returns (hex_color, theme_color_name)."""
    tag_name = color_elem.tag.split('}')[-1] if '}' in color_elem.tag else color_elem.tag

    if tag_name == 'srgbClr':
        val = color_elem.get('val')
        if val:
            hex_val = val.lower()
            if not hex_val.startswith('#'):
                hex_val = '#' + hex_val
            return (hex_val, None)

    elif tag_name == 'schemeClr':
        scheme_name = color_elem.get('val')
        if scheme_name:
            # Try theme mapping first
            if scheme_name in theme_mapping:
                return (theme_mapping[scheme_name], scheme_name)
            # Fallbacks for common theme tokens (ensure white/black when mapping missing)
            lname = scheme_name.lower()
            if lname in ("lt1", "bg1", "lt2", "bg2"):
                return ("#ffffff", scheme_name)
            if lname in ("dk1", "tx1", "dk2", "tx2"):
                return ("#000000", scheme_name)
            # Unknown scheme, return placeholder None but keep name so caller can decide
            return (None, scheme_name)

    elif tag_name == 'sysClr':
        last_clr = color_elem.get('lastClr')
        if last_clr:
            hex_val = last_clr.lower()
            if not hex_val.startswith('#'):
                hex_val = '#' + hex_val
            return (hex_val, None)

    return (None, None)


def parse_solid_fill(fill_elem, theme_mapping: Dict[str, str]) -> Dict[str, Any]:
    """Parse solid fill from XML element."""
    for color_elem in fill_elem:
        color, theme_color = extract_color_from_element(color_elem, theme_mapping)
        if color or theme_color:
            return {
                "type": "solid",
                "color": color,
                "themeColor": theme_color
            }
    return None


def parse_gradient_fill(fill_elem, theme_mapping: Dict[str, str]) -> Dict[str, Any]:
    """Parse gradient fill from XML element."""
    stops = []
    angle = 90.0  # Default vertical
    
    # Find gradient stops and angle
    for elem in fill_elem.iter():
        tag_name = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
        
        if tag_name == 'gs':
            # Gradient stop
            pos_attr = elem.get('pos')
            position = 0.0
            if pos_attr:
                try:
                    # PPT uses 0-100000 range, convert to 0.0-1.0
                    position = float(pos_attr) / 100000.0
                except (ValueError, TypeError):
                    pass
            
            # Find color in this stop
            for color_elem in elem:
                color, _ = extract_color_from_element(color_elem, theme_mapping)
                if color:
                    stops.append({"color": color, "position": position})
                    break
        
        elif tag_name == 'lin':
            # Linear gradient - get angle
            ang_attr = elem.get('ang')
            if ang_attr:
                try:
                    # PPT uses 0-21600000 (60000 per degree), convert to degrees
                    angle = (float(ang_attr) / 60000.0) % 360
                except (ValueError, TypeError):
                    pass
    
    if stops:
        return {
            "type": "gradient",
            "gradient": {
                "angle": angle,
                "stops": stops
            }
        }
    
    return None


def parse_image_fill(fill_elem, pptx_path: str, owner_xml_path: str) -> Optional[bytes]:
    """
    Parse image fill from XML element by resolving the correct relationship
    for the owner XML (slide/layout/master). Returns image bytes or None.

    owner_xml_path: the path inside the pptx zip for the XML that contained bgPr,
                    e.g. "ppt/slides/slide1.xml" or "ppt/slideLayouts/slideLayout1.xml"
    """
    try:
        # Find blip element inside this fill
        blip = None
        for elem in fill_elem.iter():
            tag_name = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            if tag_name == 'blip' or tag_name.lower().endswith('blip'):
                blip = elem
                break

        if blip is None:
            return None

        # Get the rId from the blip (namespaced attribute)
        r_id = None
        # common namespace key for embed: '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'
        for attr_name, attr_value in blip.attrib.items():
            if 'embed' in attr_name.lower() or attr_name.lower().endswith('embed'):
                r_id = attr_value
                break
            if 'id' == attr_name.lower():
                r_id = attr_value
                break

        if not r_id:
            return None

        # Build .rels path for the owner XML.
        # For "ppt/slides/slide1.xml" -> rels at "ppt/slides/_rels/slide1.xml.rels"
        # For "ppt/slideLayouts/slideLayout1.xml" -> rels at "ppt/slideLayouts/_rels/slideLayout1.xml.rels"
        parts = owner_xml_path.split('/')
        filename = parts[-1]
        rels_dir = "/".join(parts[:-1] + ['_rels'])
        rels_path = f"{rels_dir}/{filename}.rels"

        # Fallback: some masters/layouts use different placement; try owner folder rels path first,
        # then try parent 'ppt/_rels' or overall rels if necessary.
        with zipfile.ZipFile(pptx_path, 'r') as z:
            # If rels exists, parse it to map rId -> target
            target = None
            if rels_path in z.namelist():
                try:
                    rel_xml = z.read(rels_path).decode("utf-8", errors="ignore")
                    rel_root = ET.fromstring(rel_xml)
                    for rel in rel_root:
                        # 'Id' and 'Target' are typical attributes
                        if rel.get('Id') == r_id:
                            target = rel.get('Target')
                            break
                except Exception:
                    target = None

            # If not found, try slide layout/master rels via walking up one dir (safety)
            if not target:
                # Try parent folder rels: e.g. "ppt/_rels/slide1.xml.rels"
                alt_rels = f"ppt/_rels/{filename}.rels"
                if alt_rels in z.namelist():
                    try:
                        rel_xml = z.read(alt_rels).decode("utf-8", errors="ignore")
                        rel_root = ET.fromstring(rel_xml)
                        for rel in rel_root:
                            if rel.get('Id') == r_id:
                                target = rel.get('Target')
                                break
                    except Exception:
                        pass

            if not target:
                # As a last resort, check all rels entries for this PPTX (rare)
                for name in z.namelist():
                    if name.endswith(".rels"):
                        try:
                            rel_xml = z.read(name).decode("utf-8", errors="ignore")
                            rel_root = ET.fromstring(rel_xml)
                            for rel in rel_root:
                                if rel.get('Id') == r_id:
                                    target = rel.get('Target')
                                    break
                            if target:
                                break
                        except Exception:
                            continue

            if not target:
                return None

            # Normalize the target path (may be "../media/imageN.png" or "media/imageN.png")
            target = target.replace('\\', '/')
            # Resolve relative paths
            if target.startswith(".."):
                # convert "../media/image1.png" to "ppt/media/image1.png"
                target = "/".join(["ppt", target.lstrip("../")])
            elif target.startswith("/"):
                target = target.lstrip("/")
            elif not target.startswith("ppt/"):
                # often target is "media/image1.png"
                target = "ppt/" + target

            if target in z.namelist():
                try:
                    image_data = z.read(target)
                    return image_data
                except Exception:
                    return None

    except Exception:
        pass

    return None


def parse_pattern_fill(fill_elem, theme_mapping: Dict[str, str]) -> Dict[str, Any]:
    """Parse pattern fill from XML element."""
    try:
        # Get pattern type
        pattern_type = fill_elem.get('prst', 'pct50')
        
        # Get foreground and background colors
        fg_color = None
        bg_color = None
        
        for color_elem in fill_elem:
            tag_name = color_elem.tag.split('}')[-1] if '}' in color_elem.tag else color_elem.tag
            
            if tag_name == 'fgClr':
                # Foreground color
                for sub_elem in color_elem:
                    color, _ = extract_color_from_element(sub_elem, theme_mapping)
                    if color:
                        fg_color = color
                        break
            
            elif tag_name == 'bgClr':
                # Background color
                for sub_elem in color_elem:
                    color, _ = extract_color_from_element(sub_elem, theme_mapping)
                    if color:
                        bg_color = color
                        break
        
        if fg_color and bg_color:
            return {
                "type": "pattern",
                "pattern": {
                    "patternType": pattern_type,
                    "fgColor": fg_color,
                    "bgColor": bg_color
                }
            }
    except Exception:
        pass
    
    return None


def parse_background_from_xml(xml_content: str, theme_mapping: Dict[str, str], pptx_path: Optional[str] = None, owner_xml_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Parse background from slide/layout/master XML.
    Returns comprehensive background information dictionary.
    """
    try:
        root = ET.fromstring(xml_content)
        
        # Find bgPr element
        bg_pr = None
        for elem in root.iter():
            tag_name = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            if tag_name == 'bgPr':
                bg_pr = elem
                break
        
        if bg_pr is None:
            return None
        
        # Detect background type and parse accordingly
        bg_type = detect_background_type(bg_pr)
        
        if bg_type == "solid":
            for fill_elem in bg_pr:
                tag_name = fill_elem.tag.split('}')[-1] if '}' in fill_elem.tag else fill_elem.tag
                if tag_name == 'solidFill':
                    result = parse_solid_fill(fill_elem, theme_mapping)
                    if result:
                        return result
        
        elif bg_type == "gradient":
            for fill_elem in bg_pr:
                tag_name = fill_elem.tag.split('}')[-1] if '}' in fill_elem.tag else fill_elem.tag
                if tag_name == 'gradFill':
                    result = parse_gradient_fill(fill_elem, theme_mapping)
                    if result:
                        return result
        
        elif bg_type == "image":
            if pptx_path and owner_xml_path:
                for fill_elem in bg_pr:
                    tag_name = fill_elem.tag.split('}')[-1] if '}' in fill_elem.tag else fill_elem.tag
                    if tag_name == 'blipFill':
                        image_bytes = parse_image_fill(fill_elem, pptx_path, owner_xml_path)
                        if image_bytes:
                            return {
                                "type": "image",
                                "imageBytes": image_bytes
                            }
        
        elif bg_type == "pattern":
            for fill_elem in bg_pr:
                tag_name = fill_elem.tag.split('}')[-1] if '}' in fill_elem.tag else fill_elem.tag
                if tag_name == 'pattFill':
                    result = parse_pattern_fill(fill_elem, theme_mapping)
                    if result:
                        return result
        
        return None
    
    except Exception:
        return None


def extract_background_from_slide_xml(pptx_path: str, slide_index: int, theme_mapping: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Extract background from slide XML.
    
    Args:
        pptx_path: Path to PPTX file
        slide_index: Zero-based slide index
        theme_mapping: Theme color mapping dictionary
    
    Returns:
        Background dictionary or None
    """
    try:
        with zipfile.ZipFile(pptx_path, 'r') as z:
            slide_xml_path = f"ppt/slides/slide{slide_index + 1}.xml"
            if slide_xml_path not in z.namelist():
                return None
            slide_xml = z.read(slide_xml_path).decode('utf-8', errors='ignore')
            return parse_background_from_xml(slide_xml, theme_mapping, pptx_path, owner_xml_path=slide_xml_path)
    except Exception:
        return None


def extract_background_from_layout_xml(pptx_path: str, slide, theme_mapping: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Extract background from slide layout XML.
    
    Args:
        pptx_path: Path to PPTX file
        slide: PowerPoint slide object (to get layout reference)
        theme_mapping: Theme color mapping dictionary
    
    Returns:
        Background dictionary or None
    """
    try:
        if not hasattr(slide, 'slide_layout'):
            return None
        layout = slide.slide_layout
        if not hasattr(layout, 'part'):
            return None
        layout_part = layout.part
        if not hasattr(layout_part, 'partname'):
            return None
        layout_path = str(layout_part.partname).lstrip('/')
        
        with zipfile.ZipFile(pptx_path, 'r') as z:
            if layout_path not in z.namelist():
                return None
            layout_xml = z.read(layout_path).decode('utf-8', errors='ignore')
            return parse_background_from_xml(layout_xml, theme_mapping, pptx_path, owner_xml_path=layout_path)
    except Exception:
        return None


def extract_background_from_master_xml(pptx_path: str, slide, theme_mapping: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Extract background from slide master XML.
    
    Args:
        pptx_path: Path to PPTX file
        slide: PowerPoint slide object (to get master reference)
        theme_mapping: Theme color mapping dictionary
    
    Returns:
        Background dictionary or None
    """
    try:
        if not hasattr(slide, 'slide_layout'):
            return None
        layout = slide.slide_layout
        if not hasattr(layout, 'slide_master'):
            return None
        master = layout.slide_master
        if not hasattr(master, 'part'):
            return None
        master_part = master.part
        if not hasattr(master_part, 'partname'):
            return None
        master_path = str(master_part.partname).lstrip('/')
        
        with zipfile.ZipFile(pptx_path, 'r') as z:
            if master_path not in z.namelist():
                return None
            master_xml = z.read(master_path).decode('utf-8', errors='ignore')
            return parse_background_from_xml(master_xml, theme_mapping, pptx_path, owner_xml_path=master_path)
    except Exception:
        return None


def extract_slide_background_color(slide, pptx_path: Optional[str] = None, slide_index: Optional[int] = None) -> Optional[str]:
    """
    Extract slide background color with full theme/scheme support.
    
    Checks in order:
    1. Slide-specific background (via python-pptx API - direct RGB)
    2. Slide XML (for theme colors)
    3. Layout background (via python-pptx API)
    4. Layout XML (for theme colors)
    5. Master background (via python-pptx API)
    6. Master XML (for theme colors)
    
    Args:
        slide: PowerPoint slide object
        pptx_path: Path to PPTX file (required for theme color resolution)
        slide_index: Zero-based slide index (required for XML parsing)
    
    Returns:
        Hex color string or None
    """
    # First, try python-pptx API (fast path for direct RGB)
    try:
        if hasattr(slide, 'background'):
            background = slide.background
            if hasattr(background, 'fill'):
                fill = background.fill
                if hasattr(fill, 'type') and fill.type == MSO_FILL_TYPE.SOLID:
                    if hasattr(fill, 'fore_color'):
                        fore_color = fill.fore_color
                        if fore_color and hasattr(fore_color, 'rgb') and fore_color.rgb is not None:
                            return rgb_to_hex(fore_color.rgb)
    except Exception:
        pass
    
    # If python-pptx API didn't find direct RGB, try XML parsing for theme colors
    if pptx_path and slide_index is not None:
        try:
            # Get theme mapping once
            theme_mapping = get_theme_scheme_mapping(pptx_path)
            
            # Check slide XML
            bg_color = extract_background_from_slide_xml(pptx_path, slide_index, theme_mapping)
            if bg_color:
                return bg_color
            
            # Check layout XML
            bg_color = extract_background_from_layout_xml(pptx_path, slide, theme_mapping)
            if bg_color:
                return bg_color
            
            # Check master XML
            bg_color = extract_background_from_master_xml(pptx_path, slide, theme_mapping)
            if bg_color:
                return bg_color
        
        except Exception:
            pass
    
    # Fallback: Check layout/master via python-pptx API (for direct RGB)
    try:
        if hasattr(slide, 'slide_layout'):
            layout = slide.slide_layout
            if hasattr(layout, 'background'):
                layout_bg = layout.background
                if hasattr(layout_bg, 'fill'):
                    layout_fill = layout_bg.fill
                    if hasattr(layout_fill, 'type') and layout_fill.type == MSO_FILL_TYPE.SOLID:
                        if hasattr(layout_fill, 'fore_color'):
                            fore_color = layout_fill.fore_color
                            if fore_color and hasattr(fore_color, 'rgb') and fore_color.rgb is not None:
                                return rgb_to_hex(fore_color.rgb)
    except Exception:
        pass
    
    try:
        if hasattr(slide, 'slide_layout'):
            layout = slide.slide_layout
            if hasattr(layout, 'slide_master'):
                master = layout.slide_master
                if hasattr(master, 'background'):
                    master_bg = master.background
                    if hasattr(master_bg, 'fill'):
                        master_fill = master_bg.fill
                        if hasattr(master_fill, 'type') and master_fill.type == MSO_FILL_TYPE.SOLID:
                            if hasattr(master_fill, 'fore_color'):
                                fore_color = master_fill.fore_color
                                if fore_color and hasattr(fore_color, 'rgb') and fore_color.rgb is not None:
                                    return rgb_to_hex(fore_color.rgb)
    except Exception:
        pass
    
    return None


def extract_slide_background(slide, pptx_path: Optional[str] = None, slide_index: Optional[int] = None) -> dict:
    """
    Extract slide background properties.
    
    Detects background types and extracts them:
    - Solid: uses backgroundColor directly
    - Image: uses original image (no PNG generation)
    - Gradient/Pattern: renders as PNG for pixel-perfect display
    
    Args:
        slide: PowerPoint slide object
        pptx_path: Path to PPTX file (required for theme color resolution and image extraction)
        slide_index: Zero-based slide index (required for XML parsing)
    
    Returns:
        Dictionary with background properties:
        {
            "backgroundColor": "#ffffff" or None (for solid backgrounds),
            "backgroundImage": base64 image string (for image/gradient/pattern backgrounds),
            "backgroundSize": "cover",
            "backgroundPosition": "center",
            "backgroundRepeat": "no-repeat"
        }
    """
    background_info = {
        "backgroundColor": None,
        "backgroundImage": None,
        "backgroundSize": None,
        "backgroundPosition": None,
        "backgroundRepeat": None
    }
    
    # Get theme mapping
    theme_mapping = {}
    if pptx_path:
        theme_mapping = get_theme_scheme_mapping(pptx_path)
    
    # Try to extract comprehensive background info
    bg_data = None
    
    # STEP 1: Try slide XML (for all types)
    if pptx_path and slide_index is not None:
        try:
            bg_data = extract_background_from_slide_xml(pptx_path, slide_index, theme_mapping)
        except Exception:
            pass
    
    # STEP 2: Try layout XML
    if not bg_data and pptx_path:
        try:
            bg_data = extract_background_from_layout_xml(pptx_path, slide, theme_mapping)
        except Exception:
            pass
    
    # STEP 3: Try master XML
    if not bg_data and pptx_path:
        try:
            bg_data = extract_background_from_master_xml(pptx_path, slide, theme_mapping)
        except Exception:
            pass
    
    # STEP 4: Fallback to python-pptx API for solid colors
    if not bg_data:
        try:
            if hasattr(slide, 'background'):
                background = slide.background
                if hasattr(background, 'fill'):
                    fill = background.fill
                    if hasattr(fill, 'type') and fill.type == MSO_FILL_TYPE.SOLID:
                        if hasattr(fill, 'fore_color'):
                            fore_color = fill.fore_color
                            if fore_color and hasattr(fore_color, 'rgb') and fore_color.rgb is not None:
                                hex_color = rgb_to_hex(fore_color.rgb)
                                if hex_color:
                                    bg_data = {
                                        "type": "solid",
                                        "color": hex_color
                                    }
        except Exception:
            pass
    
    # STEP 5: Handle background based on type
    if bg_data:
        bg_type = bg_data.get("type", "none")
        
        # For solid backgrounds: use color directly, NO PNG
        if bg_type == "solid" and bg_data.get("color"):
            background_info["backgroundColor"] = bg_data["color"]
            # Do NOT create PNG for solid backgrounds - use color directly
        
        # For image backgrounds (blipFill): use original image, NO PNG rendering
        elif bg_type == "image" and bg_data.get("imageBytes"):
            import base64
            # Detect image format from bytes
            image_bytes = bg_data["imageBytes"]
            if image_bytes.startswith(b'\xff\xd8\xff'):
                mime_type = "image/jpeg"
            elif image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
                mime_type = "image/png"
            elif image_bytes.startswith(b'GIF'):
                mime_type = "image/gif"
            else:
                mime_type = "image/png"  # Default fallback
            
            # Convert original image bytes to base64 data URL
            image_bytes_base64 = f"data:{mime_type};base64," + base64.b64encode(image_bytes).decode()
            background_info["backgroundImage"] = image_bytes_base64
            background_info["backgroundSize"] = "cover"
            background_info["backgroundPosition"] = "center"
            background_info["backgroundRepeat"] = "no-repeat"
        
        # For gradient backgrounds: render as PNG
        elif bg_type == "gradient":
            # Render gradient as PNG
            from converter.utils.background_renderer import render_background_as_png
            png = render_background_as_png(bg_data, pptx_path)
            background_info["backgroundImage"] = png
            background_info["backgroundSize"] = "cover"
            background_info["backgroundPosition"] = "center"
            background_info["backgroundRepeat"] = "no-repeat"
        
        # For pattern backgrounds: render as PNG
        elif bg_type == "pattern":
            # Render pattern as PNG
            from converter.utils.background_renderer import render_background_as_png
            png = render_background_as_png(bg_data, pptx_path)
            background_info["backgroundImage"] = png
            background_info["backgroundSize"] = "cover"
            background_info["backgroundPosition"] = "center"
            background_info["backgroundRepeat"] = "no-repeat"
    
    # Final fallback: if no background found, use white
    if not background_info["backgroundColor"] and not background_info["backgroundImage"]:
        background_info["backgroundColor"] = "#ffffff"
    
    return background_info
