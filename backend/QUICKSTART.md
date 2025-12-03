# Quick Start Guide

Get your PPTX to JSON converter up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Start the Server

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## Step 3: Test the Converter

### Option A: Using the Test Script

```bash
python test_converter.py your_presentation.pptx
```

This will extract text and save the JSON to `output.json`.

### Option B: Using the API

**With curl:**
```bash
curl -X POST "http://localhost:8000/convert" \
  -F "file=@your_presentation.pptx" \
  -o output.json
```

**With Python:**
```python
import requests

with open("your_presentation.pptx", "rb") as f:
    response = requests.post(
        "http://localhost:8000/convert",
        files={"file": f}
    )
    print(response.json())
```

**With JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/convert', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

## Step 4: Verify Output

Check the generated JSON matches the format in `sample_1.json` through `sample_6.json`.

## What's Included

✅ **Phase 1 Complete**: Text extraction with:
- Position (x, y)
- Size (width, height)
- Font properties (size, family, bold, italic)
- Color (hex format)
- Alignment (left, center, right)
- Rotation (degrees)

⏳ **Coming Soon**:
- Phase 2: Shapes
- Phase 3: Images
- Phase 4: Styles
- Phase 5: Backgrounds
- Phase 6: Thumbnails

## Troubleshooting

**Issue**: `ModuleNotFoundError`
- **Solution**: Make sure you've installed all dependencies: `pip install -r requirements.txt`

**Issue**: `Invalid file type` error
- **Solution**: Make sure you're uploading a `.pptx` file (not `.ppt`)

**Issue**: No text extracted
- **Solution**: Check that your PPTX file contains text boxes/shapes with text

## Next Steps

- Read `plan.md` for the complete development roadmap
- Check `API_USAGE.md` for detailed API documentation
- Review `sample_*.json` files to understand the output format

