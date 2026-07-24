import zipfile, re, os

p = r"C:\Users\zab\Desktop\New Job docs\Mohammed_Zaabi_Noor_Resume_2026.docx"
z = zipfile.ZipFile(p)
xml = z.read("word/document.xml").decode("utf-8", "ignore")

# paragraphs
paras = re.split(r"</w:p>", xml)
lines = []
for para in paras:
    texts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", para, re.S)
    line = "".join(texts)
    line = (line.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            .replace("&#160;", " ").replace("&quot;", '"').replace("&apos;", "'"))
    if line.strip():
        lines.append(line.strip())
print("=== RESUME TEXT ===")
for l in lines:
    print(l)

print("\n=== embedded media ===")
for n in z.namelist():
    if n.startswith("word/media/"):
        info = z.getinfo(n)
        print(n, info.file_size, "bytes")
