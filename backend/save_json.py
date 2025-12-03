"""
Helper script to convert PPTX and save JSON to file.
Usage: python save_json.py <path_to_pptx_file> [output_file.json]
"""
import sys
import json
from converter.utils.text_extractor import extract_text_from_pptx
from datetime import datetime

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python save_json.py <path_to_pptx_file> [output_file.json]")
        sys.exit(1)
    
    pptx_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "output.json"
    
    try:
        print(f"Extracting text from: {pptx_path}")
        slides_data = extract_text_from_pptx(pptx_path)
        
        result = {
            "slides": slides_data,
            "currentSlideIndex": 0,
            "version": "1.0",
            "exportedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        # Save to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ JSON saved to: {output_file}")
        print(f"✓ Total slides: {len(slides_data)}")
        total_elements = sum(len(slide['elements']) for slide in slides_data)
        print(f"✓ Total text elements: {total_elements}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

