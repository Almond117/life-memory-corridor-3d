import bpy,sys
from mathutils import Vector
p=sys.argv[-1]; bpy.ops.import_scene.gltf(filepath=p)
root=bpy.data.objects.new('browser-transform',None); bpy.context.collection.objects.link(root)
for o in list(bpy.context.scene.objects):
 if o.type=='MESH':
  o.parent=root
  if o.name.lower().startswith('cube'): o.hide_render=True
root.rotation_euler.x=-1.57079632679; root.scale=(3.43,8.4,1.4); root.location=(0,-0.38,40.6)
scene=bpy.context.scene; scene.render.engine='BLENDER_EEVEE'; scene.render.resolution_x=1000;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.filepath='D:/hks/blender/output/web_transform_preview.png'; scene.world.color=(0.03,0.02,0.015)
bpy.ops.object.camera_add(location=(0,2.55,50.2)); cam=bpy.context.object; cam.data.lens=60; scene.camera=cam; cam.rotation_euler=(Vector((0,2.55,30))-cam.location).to_track_quat('-Z','Y').to_euler()
for loc,energy,col in [((-2,10,18),1800,(1,.8,.5)),((0,6.7,37),1500,(1,.7,.35)),((0,6.7,26),1500,(1,.7,.35)),((0,6.7,10),1500,(1,.7,.35))]:
 bpy.ops.object.light_add(type='AREA',location=loc); l=bpy.context.object; l.data.energy=energy; l.data.color=col; l.data.shape='RECTANGLE';l.data.size=8;l.rotation_euler=(Vector((0,2.5,loc[2]-12))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.render.render(write_still=True)
