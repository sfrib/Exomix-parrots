#!/usr/bin/env python3
# Fills placeholders in a label HTML with values from a JSON file
import sys, json, re

def main():
  if len(sys.argv) < 4:
    print("Usage: fill_label.py TEMPLATE.html DATA.json OUTPUT.html")
    sys.exit(1)
  tpl, data, out = sys.argv[1], sys.argv[2], sys.argv[3]
  with open(data, "r", encoding="utf-8") as f:
    payload = json.load(f)["fields"]
  with open(tpl, "r", encoding="utf-8") as f:
    html = f.read()
  # Replace {{field}} placeholders
  for k, v in payload.items():
    html = html.replace("{{"+k+"}}", str(v))
  # Clean any unreplaced placeholders
  html = re.sub(r"\{\{[^}]+\}\}", "", html)
  with open(out, "w", encoding="utf-8") as f:
    f.write(html)
  print(f"Wrote {out}")

if __name__ == "__main__":
  main()
