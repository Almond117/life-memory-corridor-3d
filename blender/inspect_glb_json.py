import json
import struct
from pathlib import Path

path = Path(r"D:\hks\blender\output\agentic_0005_retextured.glb")
data = path.read_bytes()
magic, version, length = struct.unpack_from("<4sII", data, 0)
offset = 12
json_chunk = None
while offset < length:
    chunk_len, chunk_type = struct.unpack_from("<II", data, offset)
    chunk = data[offset + 8: offset + 8 + chunk_len]
    if chunk_type == 0x4E4F534A:
        json_chunk = chunk.rstrip(b" \t\r\n\x00")
        break
    offset += 8 + chunk_len
doc = json.loads(json_chunk)
print("MAGIC", magic, "VERSION", version)
for index, node in enumerate(doc.get("nodes", [])):
    if index < 12:
        print("NODE", index, node.get("name"), "translation", node.get("translation"), "rotation", node.get("rotation"), "scale", node.get("scale"))
print("SCENES", doc.get("scenes"))
for index, mesh in enumerate(doc.get("meshes", [])):
    primitive = mesh.get("primitives", [{}])[0]
    accessor_index = primitive.get("attributes", {}).get("POSITION")
    accessor = doc.get("accessors", [])[accessor_index]
    if index < 15 or any(term in (mesh.get("name") or "").lower() for term in ["floor", "plank"]):
        print("MESH", index, mesh.get("name"), "MIN", accessor.get("min"), "MAX", accessor.get("max"))
