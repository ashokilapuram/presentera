# Perfect PPTX → JSON Converter (Presentera-Style)

A complete roadmap, tools list, architecture, and phase-by-phase plan to build a production-ready PPTX → JSON converter for your app.

## 1. Objective

Build a backend converter that takes any PPTX and outputs your custom slide JSON format, identical to:

- sample_1.json
- sample_2.json
- sample_3.json
- sample_4.json
- sample_5.json
- sample_6.json

The converter must support:

- **Phase 1**: Text extraction (current)
- **Phase 2**: Shapes
- **Phase 3**: Images
- **Phase 4**: Styles
- **Phase 5**: Backgrounds
- **Phase 6**: Thumbnails

## 2. Tech Stack

### Backend (Primary)

| Component | Library |
|-----------|---------|
| API Framework | FastAPI |
| PPT Parser | python-pptx |
| Image Handling | Pillow (later) |
| Thumbnail Rendering | LibreOffice CLI or Aspose.Slides |
| XML Parsing | lxml (for advanced shapes) |
| Server | uvicorn |
| ID Generation | uuid |

## 3. High-Level Architecture

```
PPTX Upload → Parsing Layer → Normalization Layer → JSON Builder → Output
```

### 3.1 Upload Layer

- Accept PPTX
- Validate file type

### 3.2 Parsing Layer

Extract core PPT elements:

- Slide index
- Text frames
- Font properties
- Position (left, top)
- Size (width, height)
- Colors
- Rotation

### 3.3 Normalization Layer

Convert PPT raw values → app-friendly values:

- Convert EMU → points
- Convert font styles → enums
- Extract hex colors
- Alignments → "left" | "center" | "right"
- Rotation → integer degrees
- Provide defaults for unknown values

### 3.4 JSON Builder Layer

Produce output:

```json
{
  "slides": [
    {
      "id": "uuid",
      "elements": []
    }
  ]
}
```

Matches your Presentera schema exactly.

## 4. Phase-by-Phase Development Plan

### PHASE 1 — Text Extraction (CURRENT)

Extract only text shapes

- Coordinates (x, y)
- Box size (width, height)
- Font size
- Bold / Italic
- Alignment
- Rotation
- Color
- fontFamily
- return exact JSON structure

**Libraries:**
- python-pptx
- FastAPI

### PHASE 2 — Shapes Extraction

Support:

- rectangle
- circle
- square
- rounded rectangle
- line

**Tasks:**

- Detect shape types
- Extract fill color
- Extract stroke color
- Extract stroke width
- Convert to JSON:

```json
{
  "type": "shape",
  "shapeType": "circle"
}
```

**Extra Library:**
- lxml (to read PowerPoint XML directly)

### PHASE 3 — Images Extraction

Handle:

- Embedded slide images
- PNG/JPG extraction
- Base64 encode

Add to JSON:

```json
{
  "type": "image",
  "src": "data:image/png;base64,..."
}
```

**Libraries:**
- Pillow
- python-pptx

### PHASE 4 — Styles Extraction

Extract deeper properties:

- text opacity
- paragraph spacing
- line height
- text decoration
- shadow
- text transform
- z-index

Requires XML-level parsing.

### PHASE 5 — Background Extraction

Support:

- solid background color
- gradients
- background images

Add slide-level attributes:

```json
"backgroundColor": "#ffffff",
"backgroundImage": null
```

### PHASE 6 — Thumbnail Generation

Generate PNG previews for each slide.

**Option 1 (Free):**
- LibreOffice CLI
- unoconv → PNG

**Option 2 (Best):**
- Aspose.Slides for Python (Paid)

**Output:**

```json
"thumbnail": "data:image/png;base64,..."
```

## 5. Backend Endpoints

### `/convert` (CURRENT)

- Input: PPTX
- Output: JSON (text only)

### `/convert-full` (Later)

- Output: text + shapes + images + styles

### `/thumbnail`

- Return slide thumbnails

## 6. File Structure

```
converter/
  ├── main.py
  ├── utils/
  │     ├── text_extractor.py
  │     ├── shape_extractor.py
  │     ├── image_extractor.py
  │     ├── style_extractor.py
  │     └── thumbnail_generator.py
  ├── schemas/
  │     └── slide_schema.py
  ├── requirements.txt
  └── README.md
```

## 7. Deployment Plan

### Option A — Vercel (Python Serverless)

Best for serverless + quick deployments.

### Option B — Railway / Render

FastAPI deployment using Docker.

### Option C — AWS Lambda

High scale serverless.

## 8. Success Criteria

Converter is "production-ready" when:

- ✅ Extracts all text accurately
- ⏳ Extracts shapes properly
- ⏳ Images correctly extracted
- ⏳ Backgrounds supported
- ⏳ Thumbnails generated
- ✅ JSON loads in Presentera without adjustments
- ✅ Handles ANY PPTX (even complex ones)
- ✅ Zero blank slides
- ✅ Works consistently on backend + deployed environment

## 9. Optional Enhancements

- OCR text from inside images (Tesseract)
- Remove duplicate text layers
- Auto-detect font families
- Normalize inconsistent shape colors
- Compress large base64 images

