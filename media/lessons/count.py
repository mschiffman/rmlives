import os

total = 0
for root, dirs, files in os.walk("."):
    count = len(files)
    total += count
    print(f"{root}: {count} files")

print(f"\nTotal: {total} files")