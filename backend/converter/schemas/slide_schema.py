"""
Schema definitions for PPTX to JSON conversion.
Matches Presentera-style JSON format.
"""
from typing import List, Optional, Literal, Union
from pydantic import BaseModel
from datetime import datetime


class TextElement(BaseModel):
    """Text element schema"""
    id: str
    type: Literal["text"] = "text"
    content: str
    x: float
    y: float
    width: float
    height: float
    fontSize: float
    fontWeight: Literal["normal", "bold"] = "normal"
    fontStyle: Literal["normal", "italic"] = "normal"
    textDecoration: Literal["none", "underline", "line-through"] = "none"
    textAlign: Literal["left", "center", "right", "justify"] = "left"
    color: Optional[str] = None  # Hex color (None for theme colors)
    rotation: int = 0
    fontFamily: str


class ShapeElement(BaseModel):
    """Shape element schema (for Phase 2)"""
    id: str
    type: Literal["shape"] = "shape"
    shapeType: Literal["rectangle", "circle", "square", "roundedRectangle", "line", "triangle", "star", "pentagon", "hexagon"]
    x: float
    y: float
    width: float
    height: float
    fillColor: Optional[str] = None
    borderColor: Optional[str] = None
    borderWidth: Optional[float] = None
    rotation: int = 0


class ImageElement(BaseModel):
    """Image element schema (for Phase 3)"""
    id: str
    type: Literal["image"] = "image"
    x: float
    y: float
    width: float
    height: float
    src: str  # Base64 encoded image
    rotation: int = 0
    locked: Optional[bool] = False
    isBackground: Optional[bool] = False


class TableCell(BaseModel):
    """Table cell schema"""
    text: str
    bgColor: str  # Hex color
    textColor: str  # Hex color
    borderColor: str  # Hex color
    borderWidth: float
    fontSize: float
    fontFamily: str
    fontWeight: Literal["normal", "bold"] = "normal"
    fontStyle: Literal["normal", "italic"] = "normal"
    textDecoration: Literal["none", "underline", "line-through"] = "none"
    align: Literal["left", "center", "right", "justify"] = "left"


class TableElement(BaseModel):
    """Table element schema"""
    id: str
    type: Literal["table"] = "table"
    x: float
    y: float
    width: float
    height: float
    rows: int
    cols: int
    cellWidth: float
    cellHeight: float
    data: List[List[TableCell]]  # 2D array: rows of cells
    rotation: int = 0


class Slide(BaseModel):
    """Slide schema"""
    id: str
    elements: List[Union[TextElement, ShapeElement, ImageElement, TableElement]] = []
    thumbnail: Optional[str] = None
    backgroundColor: Optional[str] = None
    backgroundImage: Optional[str] = None
    backgroundSize: Optional[str] = None
    backgroundPosition: Optional[str] = None
    backgroundRepeat: Optional[str] = None


class Presentation(BaseModel):
    """Complete presentation schema"""
    slides: List[Slide]
    currentSlideIndex: int = 0
    version: str = "1.0"
    exportedAt: str

