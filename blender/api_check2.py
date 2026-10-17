import bpy
s=bpy.context.scene
for eng in ['BLENDER_EEVEE','BLENDER_WORKBENCH','CYCLES']:
 try:s.render.engine=eng
 except:pass
 print(eng, s.render.image_settings.file_format, s.render.image_settings.bl_rna.properties['file_format'].enum_items.keys())
 try:
  s.render.image_settings.file_format='FFMPEG'; print('set success',s.render.image_settings.file_format)
 except Exception as e: print('set fail',e)
