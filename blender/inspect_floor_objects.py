import bpy
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    name = o.name.lower()
    if any(term in name for term in ["floor", "plank", "foundation", "rug", "border"]):
        mats = [m.name for m in o.data.materials if m]
        print(o.name, "MATS", mats, "DIM", tuple(round(v, 3) for v in o.dimensions), "LOC", tuple(round(v, 3) for v in o.location))
