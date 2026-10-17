import bpy, collections
p=r"D:\hks\blender\output\agentic_0005_retextured.glb"
bpy.ops.import_scene.gltf(filepath=p)
print('VERIFY',len(bpy.data.objects),len(bpy.data.meshes),len(bpy.data.materials),len(bpy.data.images))
tex_nodes=0; mats=0
for m in bpy.data.materials:
  if not m.use_nodes: continue
  mats+=1
  ims=[n.image.name for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image]
  if ims: tex_nodes+=len(ims); print('MAT',m.name,'IMAGES',ims)
print('TEX_NODES',tex_nodes,'MATS',mats)
for i in bpy.data.images:
  if i.source!='VIEWER': print('IMAGE',i.name,tuple(i.size),i.filepath, bool(i.packed_file))
