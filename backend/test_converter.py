"""
Simple test script for the PPTX to JSON converter.
Usage: python test_converter.py <path_to_pptx_file>
"""
import sys
import json
from converter.utils.text_extractor import extract_text_from_pptx

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_converter.py <path_to_pptx_file>")
        sys.exit(1)
    
    pptx_path = sys.argv[1]
    
    try:
        print(f"Extracting text from: {pptx_path}")
        slides_data = extract_text_from_pptx(pptx_path)
        
        from datetime import datetime
        
        result = {
            "slides": slides_data,
            "currentSlideIndex": 0,
            "version": "1.0",
            "exportedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        # Pretty print JSON
        print("\n" + "="*50)
        print("EXTRACTED JSON:")
        print("="*50)
        print(json.dumps(result, indent=2))
        
        # Save to file
        output_file = "output.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        print(f"\n✓ JSON saved to: {output_file}")
        print(f"✓ Total slides: {len(slides_data)}")
        total_elements = sum(len(slide['elements']) for slide in slides_data)
        print(f"✓ Total text elements: {total_elements}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

