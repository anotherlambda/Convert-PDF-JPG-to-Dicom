Convert PDF or JPG/JPEG file to Dicom Image in Mirth Connect.
============================================================
Requirements
1. Source Data: JSON(Can by any format where you need to work on mapping data)
2. Pickup PDF/JPG file from a directory based on scanned documents provided in JSON.
3. Output: .DCM in a directory

Mirth Connect
1. Source: File Reader
2. Source Data Type: JSON
3. Destination Data Type: RAW
4. Destination: Javascript Writer
5. Destination Code: return 0;
6. Source Transformer code: pdf-jpg-dicom-transformer.js
7. Sample Message: Sample.json
