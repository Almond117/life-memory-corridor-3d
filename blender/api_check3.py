import bpy
s=bpy.context.scene
print('movie',s.render.is_movie_format)
print('ffmpeg',s.render.ffmpeg)
print('build',bpy.app.build_options.ffmpeg)
