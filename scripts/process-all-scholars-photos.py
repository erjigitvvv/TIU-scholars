import openpyxl, io, os, re, shutil
from PIL import Image

def slugify(s):
    s = s.lower().strip()
    s = s.replace('‘', '').replace('’', '').replace("'", '').replace('`', '')
    s = s.replace('gʻ', 'g').replace('oʻ', 'o')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

user_uploaded_dir = 'C:/Users/Admin/.gemini/antigravity/brain/ad86992b-2d15-4b8b-b236-751ff496b9f9/.user_uploaded/'
excel_path = os.path.join(user_uploaded_dir, 'media_1795713150748_18114834.xlsx')
target_dir = 'D:/TIU-scholars/public/uploads/avatars/'

# Explicit mappings from user uploads for batch 4
explicit_user_uploads = {
    21: ('media_1795714521580_486d4b10.png', 'abduraximov-dilshod.png'),
    22: ('media_1795714524250_ca92afcd.png', 'ilxomzoda-azizbek.png'),
    23: ('media_1795714527061_a88b38ef.png', 'sadikov-shoxrux.png'),
    25: ('media_1795714532792_e848d1a7.png', 'xashimova-dilyora.png'),
    26: ('media_1795714535549_99907ff9.png', 'axmedov-dilshod.png'),
}

wb = openpyxl.load_workbook(excel_path, data_only=True)
sheet = wb.active

images_map = {}
for img in sheet._images:
    r = img.anchor._from.row if hasattr(img.anchor, '_from') else None
    if r is not None:
        images_map[r] = img

results = []
for r in range(1, 46):
    vals = [sheet.cell(r, c).value for c in range(1, 4)]
    if vals[0] and isinstance(vals[0], int):
        num = vals[0]
        name = vals[1]
        img_anchor_row = r - 1
        
        parts = name.split()
        slug = slugify(f"{parts[0]}-{parts[1] if len(parts) > 1 else ''}")
        filename = f"{slug}.png"
        target_path = os.path.join(target_dir, filename)
        
        # Check if user explicitly uploaded
        if num in explicit_user_uploads:
            src_file, explicit_name = explicit_user_uploads[num]
            filename = explicit_name
            target_path = os.path.join(target_dir, filename)
            shutil.copy2(os.path.join(user_uploaded_dir, src_file), target_path)
            results.append((num, name, f"/uploads/avatars/{filename}", "User upload"))
        elif num <= 20:
            # Already handled in batches 1, 2, 3
            # Check what's on disk
            results.append((num, name, f"/uploads/avatars/{filename}", "Already processed"))
        else:
            # Extract from Excel image!
            img_obj = images_map.get(img_anchor_row)
            if img_obj:
                raw = img_obj._data()
                pil_img = Image.open(io.BytesIO(raw))
                pil_img.save(target_path, 'PNG')
                results.append((num, name, f"/uploads/avatars/{filename}", f"Extracted from Excel ({pil_img.size})"))
            else:
                results.append((num, name, None, "No image found in Excel"))

for r in results:
    print(f"No. {r[0]:2d}: {r[1]:40s} -> {r[2]} ({r[3]})")
