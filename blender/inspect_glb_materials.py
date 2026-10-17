import bpy, collections, mathutils
path=r"C:\Users\lanxi\Downloads\agentic_0005_pack_glb_model.glb"
bpy.ops.import_scene.gltf(filepath=path)
for mat in bpy.data.materials:
    print('MAT', repr(mat.name), 'diffuse', tuple(round(x,4) for x in mat.diffuse_color), 'metallic', round(mat.metallic,3), 'rough', round(mat.roughness,3))
    if mat.use_nodes:
      for n in mat.node_tree.nodes:
        if n.type=='BSDF_PRINCIPLED':
          p=n.inputs
          def col(k): return tuple(round(x,4) for x in p[k].default_value) if k in p and hasattr(p[k],'default_value') and hasattr(p[k].default_value,'__len__') else None
          print('  BSDF base',col('Base Color'),'rough',p['Roughness'].default_value,'metal',p['Metallic'].default_value,'spec',p.get('IOR').default_value if p.get('IOR') else None)
# correct global bounds
verts=[]
for o in bpy.data.objects:
 if o.type=='MESH':
  verts.extend([o.matrix_world@v.co for v in o.data.vertices])
print('GLOBAL_BOUNDS', tuple(round(min(getattr(v,a) for v in verts),3) for a in ['x','y','z']), tuple(round(max(getattr(v,a) for v in verts),3) for a in ['x','y','z']))
# uv range and representative object by material
for mat in bpy.data.materials:
  reps=[]
  for o in bpy.data.objects:
    if o.type=='MESH' and any(s.material==mat for s in o.material_slots):
      uv=o.data.uv_layers.active
      if uv:
        vals=[loop[uv].uv for loop in o.data.loops]
        reps.append((o.name,len(o.data.polygons), (round(min(v.x for v in vals),3),round(max(v.x for v in vals),3),round(min(v.y for v in vals),3),round(max(v.y for v in vals),3))))
  if reps: print('UV',repr(mat.name),reps[0])
