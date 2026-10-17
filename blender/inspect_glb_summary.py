import bpy, collections, os
path=r"C:\Users\lanxi\Downloads\agentic_0005_pack_glb_model.glb"
bpy.ops.import_scene.gltf(filepath=path)
objs=[o for o in bpy.data.objects if o.type=='MESH']
print('SUMMARY')
print('objects',len(bpy.data.objects),'mesh_objects',len(objs),'meshes',len(bpy.data.meshes),'materials',len(bpy.data.materials),'images',len(bpy.data.images))
mat_objs=collections.defaultdict(list); uv_counts=collections.Counter(); missing_uv=[]; bounds=[]; tris=0
for o in objs:
    me=o.data
    for s in o.material_slots:
        if s.material: mat_objs[s.material.name].append(o.name)
    if me.uv_layers: uv_counts['has_uv']+=1
    else: uv_counts['no_uv']+=1; missing_uv.append(o.name)
    tris += sum(len(p.vertices)-2 for p in me.polygons)
    bb=[o.matrix_world@__import__('mathutils').Vector(c) for c in o.bound_box]
    bounds.append((min(v.x for v in bb),max(v.x for v in bb),min(v.y for v in bb),max(v.y for v in bb),min(v.z for v in bb),max(v.z for v in bb)))
print('triangles',tris,'uv_counts',dict(uv_counts))
print('bounds',tuple(round(min(x[i] for x in bounds),3) for i in range(6)),tuple(round(max(x[i] for x in bounds),3) for i in range(6)))
for mat,names in sorted(mat_objs.items(), key=lambda kv:(-len(kv[1]),kv[0])):
    print('MAT',mat,'objects',len(names),'sample',names[:4])
    m=bpy.data.materials.get(mat)
    if m and m.use_nodes:
      nodes=[]
      for n in m.node_tree.nodes:
        nodes.append((n.type,n.name,getattr(getattr(n,'image',None),'name',None)))
      print(' NODES',nodes)
print('NO_UV sample',missing_uv[:20])
for img in bpy.data.images:
    print('IMAGE',repr(img.name),tuple(img.size),repr(img.filepath),img.source, bool(img.packed_file))
for o in bpy.data.objects:
    if o.type in {'CAMERA','EMPTY'}:
      print('SPECIAL',o.name,o.type,'loc',tuple(round(v,3) for v in o.location),'rot',tuple(round(v,3) for v in o.rotation_euler))
