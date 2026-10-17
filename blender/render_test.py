import bpy,sys
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
p=args[0]; out=args[1] if len(args)>1 else 'D:/hks/blender/output/test.png'; bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name.lower().startswith('cube'): o.hide_render=True; o.hide_viewport=True
scene=bpy.context.scene; scene.render.engine='BLENDER_EEVEE'; scene.render.resolution_x=600; scene.render.resolution_y=800; scene.render.resolution_percentage=100; scene.render.image_settings.file_format='PNG'; scene.render.filepath=out; scene.world.color=(0.01,0.01,0.015)
bpy.ops.object.camera_add(location=(0,-5,2.8)); cam=bpy.context.object; cam.data.lens=52; scene.camera=cam; cam.rotation_euler=(Vector((0,0,0.4))-cam.location).to_track_quat('-Z','Y').to_euler()
for typ,loc,energy,col,size in [('AREA',(-3,-4,5),1200,(1.0,.75,.48),4),('AREA',(3,-2,2),650,(.35,.55,1),3),('AREA',(0,2,4),900,(1,.45,.25),3)]:
 bpy.ops.object.light_add(type=typ,location=loc); l=bpy.context.object; l.data.energy=energy; l.data.color=col; l.data.shape='DISK'; l.data.size=size; l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.render.render(write_still=True)

