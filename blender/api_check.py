import bpy
s=bpy.context.scene
print('image formats', [i.identifier for i in bpy.types.ImageFormatSettings.bl_rna.properties['file_format'].enum_items])
print('render props', [p.identifier for p in bpy.types.RenderSettings.bl_rna.properties if 'movie' in p.identifier.lower() or 'file' in p.identifier.lower() or 'format' in p.identifier.lower()])
print('ffmpeg props', [p.identifier for p in bpy.types.FFmpegSettings.bl_rna.properties])
