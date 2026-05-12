import os
import re

def renumber_files(start_from, add_amount):
    folder_path = "."  # Run from the folder itself
    audio_extensions = {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.opus'}
    
    files = []
    for filename in os.listdir(folder_path):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in audio_extensions:
            continue
        match = re.match(r'^(\d+)(.*)', filename)
        if match:
            num = int(match.group(1))
            if num >= start_from:
                files.append((num, filename))
    
    files.sort(reverse=True)
    
    for num, filename in files:
        new_num = num + add_amount
        new_filename = re.sub(r'^\d+', str(new_num), filename)
        src = os.path.join(folder_path, filename)
        dst = os.path.join(folder_path, new_filename)
        print(f"  {filename}  →  {new_filename}")
        os.rename(src, dst)

    print(f"\nDone! Renamed {len(files)} file(s).")


# --- Configure these ---
START_FROM = 59   # ← renumber files starting from this number
ADD_AMOUNT = 1    # ← shift by this amount (1 means 53→54, 68→69)

renumber_files(START_FROM, ADD_AMOUNT)