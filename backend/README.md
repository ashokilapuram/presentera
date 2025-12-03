# PPTX to JSON Converter (Presentera-Style)

A production-ready backend converter that transforms PowerPoint (PPTX) files into a custom JSON format compatible with Presentera.

## Features

- **Phase 1**: Text extraction (coordinates, font properties, alignment, rotation, colors)
- **Phase 2**: Shapes extraction (planned)
- **Phase 3**: Images extraction (planned)
- **Phase 4**: Styles extraction (planned)
- **Phase 5**: Background extraction (planned)
- **Phase 6**: Thumbnail generation (planned)

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /convert

Convert a PPTX file to JSON format (Phase 1: Text only)

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PPTX file

**Response:**
```json
{
  "slides": [
    {
      "id": "uuid",
      "elements": [
        {
          "type": "text",
          "x": 100,
          "y": 200,
          "width": 500,
          "height": 100,
          "text": "Hello World",
          "fontSize": 24,
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

## Project Structure

```
.
├── main.py                 # FastAPI application
├── converter/
│   ├── utils/
│   │   ├── text_extractor.py    # Phase 1: Text extraction
│   │   ├── shape_extractor.py   # Phase 2: Shapes (planned)
│   │   ├── image_extractor.py   # Phase 3: Images (planned)
│   │   ├── style_extractor.py   # Phase 4: Styles (planned)
│   │   └── thumbnail_generator.py # Phase 6: Thumbnails (planned)
│   └── schemas/
│       └── slide_schema.py      # JSON schema definitions
├── requirements.txt
└── README.md
```

## Development Phases

See `plan.md` for detailed phase-by-phase development plan.

## License

MIT

