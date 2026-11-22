import base64

lines = []
for i in range(1, 7):
    with open(f"images/project{i}.jpg", "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
        lines.append(f'const pImg{i} = "data:image/jpeg;base64,{b64}";')

with open("project_images.js", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("project_images.js created successfully!")
