import json

file_path = "ncert_dataset.jsonl"

count = 0
bad_lines = 0
missing_fields = 0

with open(file_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            count += 1

            # Check expected fields
            if not all (k in data for k in ("class", "subject", "chapter", "content")):
                print(f"[!] Line {i} missing required fields: {data}")
                missing_fields += 1

        except json.JSONDecodeError as e:
            print(f"[✗] Line {i} is invalid JSON: {e}")
            bad_lines += 1

print("\n🧹 Verification Report:")
print(f"  → Total lines checked: {count + bad_lines}")
print(f"  → Valid lines: {count}")
print(f"  → Invalid JSON lines: {bad_lines}")
print(f"  → Lines missing fields: {missing_fields}")

if bad_lines == 0 and missing_fields == 0:
    print("\n✅ Your JSONL file looks GOOD!")
else:
    print("\n⚠️ Your JSONL has some issues. Fix recommended.")
