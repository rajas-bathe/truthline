#!/usr/bin/env python3
"""
TruthLine AI — Python PyMuPDF Service Script
Extracts structured text, page count, and metadata from PDF files.
"""

import sys
import json
import os

def extract_pdf(file_path):
    try:
        import fitz  # PyMuPDF
    except ImportError:
        return {
            "success": False,
            "error": "PyMuPDF (fitz) is not installed in the Python environment. Run 'pip install pymupdf' to enable.",
            "isMissingDependency": True
        }

    if not os.path.exists(file_path):
        return {"success": False, "error": f"File not found: {file_path}"}

    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        full_text = []

        for page_num in range(page_count):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                full_text.append(text)

        combined_text = "\n\n".join(full_text).strip()
        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "creationDate": doc.metadata.get("creationDate", "")
        }

        doc.close()

        return {
            "success": True,
            "pageCount": page_count,
            "text": combined_text,
            "metadata": metadata
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)

    path = sys.argv[1]
    result = extract_pdf(path)
    print(json.dumps(result))
