import bpy,sys
p=sys.argv[-1]; bpy.ops.import_scene.gltf(filepath=p)
seen=set()
for o in bpy.context.scene.objects:
 if o.type!='MESH': continue
 for m in ([o.data.materials[0]] if o.data.materials else []):
  if not m or m.name in seen: continue
  seen.add(m.name)
  print(m.name,'diffuse',tuple(round(v,3) for v in m.diffuse_color[:3]),'nodes',m.use_nodes)
