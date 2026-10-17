import bpy,sys
from mathutils import Vector
p=sys.argv[-1]
print('PATH',p)
bpy.ops.import_scene.gltf(filepath=p)
objs=[o for o in bpy.data.objects if o.type=='MESH']
print('objs',len(objs))
mins=Vector((1e9,1e9,1e9)); maxs=Vector((-1e9,-1e9,-1e9))
for o in objs:
 bb=[o.matrix_world@Vector(c) for c in o.bound_box]
 mn=Vector((min(v.x for v in bb),min(v.y for v in bb),min(v.z for v in bb))); mx=Vector((max(v.x for v in bb),max(v.y for v in bb),max(v.z for v in bb)))
 mins.x=min(mins.x,mn.x);mins.y=min(mins.y,mn.y);mins.z=min(mins.z,mn.z);maxs.x=max(maxs.x,mx.x);maxs.y=max(maxs.y,mx.y);maxs.z=max(maxs.z,mx.z)
print('bounds',mins[:],maxs[:],'size',(maxs-mins)[:],'center',((maxs+mins)/2)[:])
for o in objs[:10]: print(o.name, tuple(round(x,3) for x in o.location), tuple(round(x,3) for x in o.dimensions))
