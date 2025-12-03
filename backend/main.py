"""
FastAPI application for PPTX to JSON conversion.
Extracts text, shapes, images, and background colors from PowerPoint files.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
from datetime import datetime
from converter.utils.text_extractor import extract_text_from_pptx
from converter.schemas.slide_schema import Presentation, Slide, TextElement

app = FastAPI(
    title="PPTX to JSON Converter API",
    description="""
    Convert PowerPoint (.pptx) files to Presentera-style JSON format.
    
    **Supported Features:**
    - ✅ Text extraction with font properties, colors, alignment
    - ✅ Shape extraction (rectangles, circles, squares, lines)
    - ✅ Image extraction (base64 encoded)
    - ✅ Background color extraction (solid fills)
    
    **API Endpoints:**
    - `POST /convert` - Convert PPTX file to JSON
    - `GET /` - API information and health status
    - `GET /health` - Health check endpoint
    - `GET /docs` - Interactive API documentation (Swagger UI)
    """,
    version="1.1.0"
)

# Enable CORS
# Get allowed origins from environment variable, default to "*" for development
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allowed_origins = ["*"]
else:
    # Split comma-separated origins and strip whitespace
    allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    API Information and Health Check
    
    Returns API status, version, and supported features.
    """
    return {
        "status": "ok",
        "message": "PPTX to JSON Converter API",
        "version": "1.1.0",
        "features": {
            "text_extraction": True,
            "shape_extraction": True,
            "image_extraction": True,
            "background_extraction": True
        }
    }


@app.post("/convert")
async def convert_pptx(
    file: UploadFile = File(...)
):
    """
    Convert PPTX file to JSON format.
    Always returns JSON as a downloadable file.
    
    **Extraction Features:**
    - **Text Elements**: Extracts all text with font properties, colors, alignment, rotation
    - **Shape Elements**: Extracts geometric shapes (rectangles, circles, squares, lines) with colors
    - **Image Elements**: Extracts images as base64 encoded PNG/JPEG
    - **Background Colors**: Extracts slide background colors (solid fills)
    
    **Parameters:**
    - `file`: PPTX file to convert (required)
    
    **Returns:**
    JSON file download containing:
    - `slides`: Array of slide objects with extracted elements
    - `currentSlideIndex`: Index of current slide (default: 0)
    - `version`: API version
    - `exportedAt`: ISO timestamp of export
    
    Each slide contains:
    - `elements`: Array of text, shape, and image elements
    - `backgroundColor`: Slide background color (hex format)
    - `backgroundImage`: Background image if present
    - Other background properties
    
    **Example Response:**
    ```json
    {
      "slides": [
        {
          "id": "uuid",
          "elements": [
            {"type": "text", ...},
            {"type": "shape", ...},
            {"type": "image", "src": "data:image/png;base64,..."}
          ],
          "backgroundColor": "#ffffff"
        }
      ],
      "currentSlideIndex": 0,
      "version": "1.0",
      "exportedAt": "2024-01-01T00:00:00Z"
    }
    ```
    """
    # Validate file type
    if not file.filename.endswith(('.pptx', '.PPTX')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a .pptx file."
        )
    
    # Create temporary file to save uploaded PPTX
    temp_file = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract text from PPTX
        slides_data = extract_text_from_pptx(temp_file_path)
        
        # Build response with all required fields
        response_data = {
            "slides": slides_data,
            "currentSlideIndex": 0,
            "version": "1.0",
            "exportedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        # Always return as downloadable JSON file
        # Generate output filename based on input filename
        base_name = os.path.splitext(file.filename)[0]
        output_filename = f"{base_name}.json"
        
        # Convert to JSON string
        json_str = json.dumps(response_data, indent=2, ensure_ascii=False)
        
        return Response(
            content=json_str,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{output_filename}"'
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PPTX file: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

