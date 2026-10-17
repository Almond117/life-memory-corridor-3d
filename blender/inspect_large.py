import bpy,sys
from mathutils import Vector
p=sys.argv[-1]; bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.context.scene.objects:
 if o.type!='MESH': continue
 vs=[o.matrix_world@Vector(c) for c in o.bound_box]; mi=Vector((min(v.x for v in vs),min(v.y for v in vs),min(v.z for v in vs))); ma=Vector((max(v.x for v in vs),max(v.y for v in vs),max(v.z for v in vs))); d=ma-mi
 if d.x>3 or d.y>3 or d.z>3: print(o.name,'dim',tuple(round(v,3) for v in d),'min',tuple(round(v,3) for v in mi),'max',tuple(round(v,3) for v in ma))
