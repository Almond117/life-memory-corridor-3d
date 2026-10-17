import bpy,sys
from mathutils import Vector
p=sys.argv[-1]; bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.context.scene.objects:
 if o.type!='MESH': continue
 if any(k in o.name for k in ['Floor plank 00 00','Wall 1 bay 0','Barrel vaulted','Transverse arch 00','Rear wall','Woven rug']):
  vs=[o.matrix_world@Vector(c) for c in o.bound_box]
  mi=Vector((min(v.x for v in vs),min(v.y for v in vs),min(v.z for v in vs))); ma=Vector((max(v.x for v in vs),max(v.y for v in vs),max(v.z for v in vs)))
  print(o.name,'min',tuple(round(x,3) for x in mi),'max',tuple(round(x,3) for x in ma),'dim',tuple(round(x,3) for x in (ma-mi)))
