import os
import zipfile
import xml.etree.ElementTree as ET

def docx_to_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = []
            for p in root.findall('.//w:p', ns):
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                if texts:
                    paragraphs.append(''.join(texts))
            return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error: {str(e)}"

desktop = r'C:\Users\User\OneDrive\Desktop'
project_docx = os.path.join(desktop, 'Project.docx')
internship_docx = os.path.join(desktop, 'Internship.docx')

if os.path.exists(project_docx):
    print("Project.docx exists")
    txt = docx_to_text(project_docx)
    with open('project_full.txt', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Wrote project_full.txt")
else:
    print("Project.docx does not exist")

if os.path.exists(internship_docx):
    print("Internship.docx exists")
    txt = docx_to_text(internship_docx)
    with open('internship_full.txt', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Wrote internship_full.txt")
else:
    print("Internship.docx does not exist")
