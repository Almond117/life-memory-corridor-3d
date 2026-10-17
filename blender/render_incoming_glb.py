import bpy, sys
from mathutils import Vector
p=sys.argv[-1]
bpy.ops.import_scene.gltf(filepath=p)
mins=Vector((1e9,1e9,1e9)); maxs=Vector((-1e9,-1e9,-1e9))
for o in bpy.context.scene.objects:
    if o.type!='MESH': continue
    for c in o.bound_box:
        v=o.matrix_world@Vector(c)
        mins.x=min(mins.x,v.x); mins.y=min(mins.y,v.y); mins.z=min(mins.z,v.z)
        maxs.x=max(maxs.x,v.x); maxs.y=max(maxs.y,v.y); maxs.z=max(maxs.z,v.z)
mid=(mins+maxs)/2
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1000; scene.render.resolution_y=700; scene.render.resolution_percentage=100
scene.render.filepath='D:/hks/blender/output/incoming_glb_preview.png'
scene.world.color=(0.06,0.04,0.03)
for o in scene.objects:
    if o.type=='MESH': o.select_set(False)
# camera looking down -z from near front
bpy.ops.object.camera_add(location=(0,4.2,7.5))
cam=bpy.context.object
cam.data.lens=32
scene.camera=cam

def track(obj, target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
track(cam,(0,4.3,0))
# lights
bpy.ops.object.light_add(type='AREA', location=(-3,10,5)); key=bpy.context.object; key.data.energy=1000; key.data.shape='RECTANGLE'; key.data.size=8; track(key,(0,3,0))
bpy.ops.object.light_add(type='AREA', location=(4,6,2)); fill=bpy.context.object; fill.data.energy=700; fill.data.color=(1.0,.42,.25); fill.data.size=5; track(fill,(0,3,0))
bpy.ops.object.light_add(type='AREA', location=(0,5,-3)); back=bpy.context.object; back.data.energy=900; back.data.color=(.5,.72,1.0); back.data.size=4; track(back,(0,4,2))
scene.render.film_transparent=False
bpy.ops.wm.save_as_mainfile(filepath='D:/hks/blender/output/incoming_glb_preview.blend')
bpy.ops.render.render(write_still=True)
