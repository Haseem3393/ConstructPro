import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

export function runExtraction() {
  const docxPath = 'C:\\Users\\User\\Downloads\\Internship.docx';
  const outputPath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\7573f5d3-644f-4d50-9fcd-abbe13be1816\\scratch\\internship_downloads_text.txt';

  try {
    if (!fs.existsSync(docxPath)) {
      console.log('Docx file not found at ' + docxPath);
      return;
    }

    const buffer = fs.readFileSync(docxPath);
    let offset = 0;
    let found = false;

    while (offset < buffer.length - 30) {
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const filenameLen = buffer.readUInt16LE(offset + 26);
        const extraFieldLen = buffer.readUInt16LE(offset + 28);
        
        const filename = buffer.toString('utf8', offset + 30, offset + 30 + filenameLen);
        
        if (filename === 'word/document.xml') {
          const dataOffset = offset + 30 + filenameLen + extraFieldLen;
          const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
          
          let xmlContent = '';
          if (compressionMethod === 8) {
            xmlContent = zlib.inflateRawSync(compressedData).toString('utf8');
          } else if (compressionMethod === 0) {
            xmlContent = compressedData.toString('utf8');
          } else {
            console.log('Unsupported compression method: ' + compressionMethod);
            return;
          }
          
          const text = xmlContent.replace(/<[^>]+>/g, (match) => {
            if (match === '<w:p>' || match === '</w:p>' || match === '<w:br/>') {
              return '\n';
            }
            return '';
          });
          
          fs.writeFileSync(outputPath, text, 'utf8');
          console.log('Docx extracted successfully to ' + outputPath);
          return;
        }
        
        offset += 30 + filenameLen + extraFieldLen + compressedSize;
      } else {
        offset++;
      }
    }
    console.log('word/document.xml not found in docx');
  } catch (err: any) {
    console.error('Error extracting docx:', err);
  }
}
