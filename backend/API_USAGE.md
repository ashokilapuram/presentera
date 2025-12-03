# API Usage Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

3. **Test the API:**
   ```bash
   curl -X POST "http://localhost:8000/convert" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@your_presentation.pptx"
   ```

## Endpoints

### POST /convert

Converts a PPTX file to JSON format (Phase 1: Text extraction only).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: PPTX file (form field name: `file`)

**Response:**
```json
{
  "slides": [
    {
      "id": "uuid-string",
      "elements": [
        {
          "type": "text",
          "x": 100.0,
          "y": 200.0,
          "width": 500.0,
          "height": 100.0,
          "text": "Hello World",
          "fontSize": 24.0,
          "fontFamily": "Arial",
          "bold": false,
          "italic": false,
          "color": "#000000",
          "alignment": "left",
          "rotation": 0
        }
      ]
    }
  ]
}
```

**Example using Python requests:**
```python
import requests

url = "http://localhost:8000/convert"
files = {"file": open("presentation.pptx", "rb")}
response = requests.post(url, files=files)
json_data = response.json()
print(json_data)
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/convert" \
  -F "file=@presentation.pptx" \
  -o output.json
```

**Example using JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/convert', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### GET /

Health check and API information.

**Response:**
```json
{
  "status": "ok",
  "message": "PPTX to JSON Converter API",
  "version": "1.0.0",
  "phase": "Phase 1: Text Extraction"
}
```

### GET /health

Simple health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid file type. Please upload a .pptx file."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error processing PPTX file: <error message>"
}
```

## Testing

### Using the test script:
```bash
python test_converter.py path/to/your/presentation.pptx
```

This will:
- Extract text from the PPTX
- Display the JSON output
- Save it to `output.json`

## Next Steps

- Phase 2: Shapes extraction
- Phase 3: Images extraction
- Phase 4: Styles extraction
- Phase 5: Background extraction
- Phase 6: Thumbnail generation

See `plan.md` for the complete roadmap.

