import bpy, sys, os, math
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
if len(args)<5: raise SystemExit('photo? no, need 4 glb + outdir')
paths=args[:4]; outdir=args[4]
os.makedirs(outdir,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=420; scene.render.resolution_y=420; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=True
scene.world=bpy.data.worlds.new('transparent')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(0.012,0.015,0.024,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=0.2
# lighting

def add_area(loc,energy,color,size,target=(0,0,0)):
 bpy.ops.object.light_add(type='AREA',location=loc); l=bpy.context.object; l.data.energy=energy;l.data.color=color;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector(target)-l.location).to_track_quat('-Z','Y').to_euler();return l
add_area((-3.5,-4.5,5.5),950,(1,.78,.58),4)
add_area((3,-2,3),650,(.35,.52,1),3)
add_area((0,3.5,5),1100,(1,.36,.16),3)
add_area((0,0,7),350,(1,1,1),3)
# camera
bpy.ops.object.camera_add(location=(0,-5.6,2.2)); cam=bpy.context.object; cam.data.lens=58; scene.camera=cam
cam.rotation_euler=(Vector((0,0,0.15))-cam.location).to_track_quat('-Z','Y').to_euler()

def import_model(path,name):
 before=set(bpy.context.scene.objects); bpy.ops.import_scene.gltf(filepath=path); imported=[o for o in bpy.context.scene.objects if o not in before]
 root=bpy.data.objects.new(name+'_root',None); scene.collection.objects.link(root)
 for o in imported:
  if o.type=='MESH' and o.name.lower().startswith('cube'): o.hide_render=True; o.hide_viewport=True
  o.parent=root
 return root
roots=[]
for i,p in enumerate(paths): roots.append(import_model(p,f'model{i+1}'))
for i,root in enumerate(roots):
 # center each model on image; size normalized by measured bounds
 mesh_objs=[o for o in root.children_recursive if o.type=='MESH' and not o.hide_render]
 mins=Vector((1e9,1e9,1e9)); maxs=Vector((-1e9,-1e9,-1e9))
 for o in mesh_objs:
  for c in o.bound_box:
   v=o.matrix_world@Vector(c); mins.x=min(mins.x,v.x); mins.y=min(mins.y,v.y); mins.z=min(mins.z,v.z); maxs.x=max(maxs.x,v.x); maxs.y=max(maxs.y,v.y); maxs.z=max(maxs.z,v.z)
 center=(mins+maxs)/2; size=max(maxs.x-mins.x,maxs.y-mins.y,maxs.z-mins.z)
 root.location=(-center.x,-center.y,-center.z+0.1); root.scale=(2.25/size,2.25/size,2.25/size)
 # ensure only current visible
 for r in roots: r.hide_render=True
 root.hide_render=False
 if i==0:
  for k in range(16):
   root.rotation_euler=(0,0,math.radians(k*360/16)); root.keyframe_insert('rotation_euler',frame=k+1)
   scene.render.filepath=os.path.join(outdir,f'hero_{k:02d}.png'); scene.frame_set(k+1); bpy.ops.render.render(write_still=True)
 else:
  root.rotation_euler=(0,0,math.radians(-8 if i==1 else (5 if i==2 else -4)))
  scene.render.filepath=os.path.join(outdir,f'model_{i+1}.png'); bpy.ops.render.render(write_still=True)
print('STILLS_DONE',outdir)
