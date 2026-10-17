import bpy, sys, math, os
from mathutils import Vector

# Usage: blender -b --factory-startup --python this.py -- photo glb1 glb2 glb3 glb4 out.mp4 audio.wav
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
if len(args) < 6:
    raise SystemExit('expected photo + 4 glb paths + output + audio')
photo_path, *rest = args
glb_paths = rest[:4]
out_path = rest[4]
audio_path = rest[5]

FPS = 18
W, H = 540, 960
END = FPS * 30

# Reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = W
scene.render.resolution_y = H
scene.render.resolution_percentage = 100
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = END
scene.render.image_settings.file_format = 'PNG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'MEDIUM'
scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
scene.render.ffmpeg.audio_codec = 'AAC'
scene.render.ffmpeg.audio_bitrate = 192
frames_dir = os.path.splitext(out_path)[0] + '_frames'
os.makedirs(frames_dir, exist_ok=True)
scene.render.filepath = os.path.join(frames_dir, 'frame_')
scene.render.film_transparent = False
try:
    scene.view_settings.look = 'AgX - Medium High Contrast'
except Exception:
    pass
scene.world.color = (0.006, 0.008, 0.012)

# Helpers
def mat_principled(name, base, rough=0.45, metallic=0.0, emission=None, emission_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*base, 1)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metallic
    if emission is not None:
        if 'Emission Color' in bs.inputs:
            bs.inputs['Emission Color'].default_value = (*emission, 1)
            bs.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bs.inputs:
            bs.inputs['Emission'].default_value = (*emission, 1)
            bs.inputs['Emission Strength'].default_value = emission_strength
    return m

def add_area(name, loc, energy, color, size, target=(0,0,0.5)):
    bpy.ops.object.light_add(type='AREA', location=loc)
    l = bpy.context.object
    l.name = name
    l.data.energy = energy
    l.data.color = color
    l.data.shape = 'DISK'
    l.data.size = size
    l.rotation_euler = (Vector(target) - l.location).to_track_quat('-Z','Y').to_euler()
    return l

def set_bezier(obj):
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'BEZIER'

def look_at(obj, target):
    return (Vector(target) - obj.location).to_track_quat('-Z','Y').to_euler()

def key_scale(obj, frame, s):
    obj.scale = (s,s,s)
    obj.keyframe_insert('scale', frame=frame)

def key_loc(obj, frame, loc):
    obj.location = loc
    obj.keyframe_insert('location', frame=frame)

def key_vis_scale(obj, f1, f2, start=0.001, end=1.0):
    key_scale(obj, f1, start); key_scale(obj, f2, end)
    set_bezier(obj)

def make_text(body, name, size=0.42, z=2.15, y=-0.18, color=(0.94,0.95,0.98), extrude=0.002):
    cu = bpy.data.curves.new(name + '_curve', 'FONT')
    cu.body = body
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.size = size
    cu.extrude = extrude
    cu.bevel_depth = 0.002
    cu.bevel_resolution = 2
    font_candidates = [r'C:\Windows\Fonts\simhei.ttf', r'C:\Windows\Fonts\NotoSansSC-VF.ttf']
    for fp in font_candidates:
        if os.path.exists(fp):
            try:
                cu.font = bpy.data.fonts.load(fp)
                break
            except Exception:
                pass
    obj = bpy.data.objects.new(name, cu)
    scene.collection.objects.link(obj)
    obj.location = (0, y, z)
    obj.rotation_euler = (math.pi/2, 0, 0)
    m = mat_principled(name+'_mat', color, rough=0.3, emission=color, emission_strength=0.22)
    obj.data.materials.append(m)
    obj.scale = (0.001,0.001,0.001)
    return obj

def show_text(obj, start, end, hold_end=None):
    if hold_end is None: hold_end = end
    key_scale(obj, start-6, 0.001)
    key_scale(obj, start, 1.0)
    key_scale(obj, hold_end, 1.0)
    key_scale(obj, end+6, 0.001)
    set_bezier(obj)

# Stage floor and backdrop
floor_mat = mat_principled('stage_floor', (0.012,0.014,0.020), rough=0.28, metallic=0.15)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0,0,-1.03))
floor = bpy.context.object
floor.name = 'stage_floor'
floor.data.materials.append(floor_mat)
# a narrow rear plinth gives the hero a keynote stage edge
plinth_mat = mat_principled('plinth', (0.025,0.028,0.038), rough=0.25, metallic=0.25)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=3.4, depth=0.16, location=(0,0,-0.95))
plinth = bpy.context.object
plinth.name = 'hero_plinth'
plinth.data.materials.append(plinth_mat)

# Lighting: soft key, cool fill, warm rim
add_area('key', (-4.5,-5.5,7.0), 1000, (1.0,0.82,0.62), 5.0, (0,0,0.4))
add_area('fill', (4.5,-2.0,3.5), 600, (0.35,0.55,1.0), 4.0, (0,0,0.5))
add_area('rim', (0,4.0,5.5), 1100, (1.0,0.40,0.18), 4.0, (0,0,0.8))
add_area('top_soft', (0,0,8.0), 500, (1.0,1.0,1.0), 3.0, (0,0,0))

# Camera
bpy.ops.object.camera_add(location=(0,-4.2,2.6))
cam = bpy.context.object
cam.name = 'keynote_camera'
cam.data.lens = 54
scene.camera = cam
cam.rotation_euler = look_at(cam, (0,0,0.6))
# close-to-far opening
cam.keyframe_insert('location', frame=1); cam.keyframe_insert('rotation_euler', frame=1)
cam.location = (0,-10.5,2.7); cam.data.lens = 52; cam.rotation_euler = look_at(cam,(0,0,0.55))
cam.keyframe_insert('location', frame=72); cam.keyframe_insert('rotation_euler', frame=72); cam.data.keyframe_insert('lens', frame=72)
cam.location = (0,-11.2,2.8); cam.rotation_euler = look_at(cam,(0,0,0.55))
cam.keyframe_insert('location', frame=END); cam.keyframe_insert('rotation_euler', frame=END)
set_bezier(cam)

# Photo plane
img = bpy.data.images.load(photo_path, check_existing=True)
photo_mat = bpy.data.materials.new('photo_material')
photo_mat.use_nodes = True
nt = photo_mat.node_tree
bs = nt.nodes.get('Principled BSDF')
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
nt.links.new(tex.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = 0.42
bpy.ops.mesh.primitive_plane_add(size=2, location=(0,0,1.25), rotation=(math.pi/2,0,0))
photo = bpy.context.object; photo.name='opening_photo'; photo.scale=(2.25,1.50,1.0); photo.data.materials.append(photo_mat)
photo.keyframe_insert('scale', frame=1)
photo.scale=(2.25,1.50,1.0); photo.keyframe_insert('scale', frame=62)
photo.scale=(0.15,0.10,1.0); photo.keyframe_insert('scale', frame=104)
photo.scale=(0.001,0.001,0.001); photo.keyframe_insert('scale', frame=118)
set_bezier(photo)

# Tiny photo frame rim
rim_mat = mat_principled('photo_rim', (0.15,0.16,0.19), rough=0.25, metallic=0.6)
for x,z,sx,sz in [(0,2.77,2.32,0.035),(0,-0.27,2.32,0.035),(-2.32,1.25,0.035,1.52),(2.32,1.25,0.035,1.52)]:
    bpy.ops.mesh.primitive_cube_add(location=(x,-0.03,z))
    r=bpy.context.object; r.scale=(sx,0.025,sz); r.data.materials.append(rim_mat)
    r.scale=(sx,0.025,sz); r.keyframe_insert('scale',frame=1); r.keyframe_insert('scale',frame=100); r.scale=(0.001,0.001,0.001); r.keyframe_insert('scale',frame=120); set_bezier(r)

# Import GLB and create animation roots
def import_model(path, name, base_scale=2.2, hide_cube=True):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    imported = [o for o in bpy.context.scene.objects if o not in before]
    root = bpy.data.objects.new(name+'_root', None)
    scene.collection.objects.link(root)
    for o in imported:
        if o.type == 'MESH' and hide_cube and o.name.lower().startswith('cube'):
            o.hide_render=True; o.hide_viewport=True
        o.parent = root
    root.scale = (base_scale,base_scale,base_scale)
    root.location = (0,0,0.15)
    return root

hero = import_model(glb_paths[0], 'hero', 2.35)
hero.rotation_euler=(0,0,0)
key_scale(hero,1,0.001); key_scale(hero,66,0.001); key_scale(hero,122,1.0); key_scale(hero,180,1.0); key_scale(hero,270,1.0); key_scale(hero,420,0.001); set_bezier(hero)
hero.rotation_euler=(0,0,0); hero.keyframe_insert('rotation_euler',frame=120)
hero.rotation_euler=(0,0,math.radians(18)); hero.keyframe_insert('rotation_euler',frame=185)
hero.rotation_euler=(0,0,math.radians(-16)); hero.keyframe_insert('rotation_euler',frame=250)
hero.rotation_euler=(0,0,math.radians(0)); hero.keyframe_insert('rotation_euler',frame=300); set_bezier(hero)

m2 = import_model(glb_paths[1], 'travel', 1.55); m2.location=(-2.35,0,0.18)
m3 = import_model(glb_paths[2], 'graduation', 1.55); m3.location=(0,0,0.18)
m4 = import_model(glb_paths[3], 'award', 1.55); m4.location=(2.35,0,0.18)
for idx,root in enumerate([m2,m3,m4]):
    key_scale(root,1,0.001); key_scale(root,270,0.001); key_scale(root,320,1.0); key_scale(root,410,1.0); key_scale(root,430,0.001); set_bezier(root)
    root.rotation_euler=(0,0,math.radians(-8 if idx==0 else (5 if idx==1 else -4))); root.keyframe_insert('rotation_euler',frame=320)
    root.rotation_euler=(0,0,math.radians(8 if idx==0 else (-5 if idx==1 else 4))); root.keyframe_insert('rotation_euler',frame=410); set_bezier(root)
# Hero remains center at lineup as first item, but is smaller
key_scale(hero,270,0.001); key_scale(hero,320,1.0); key_scale(hero,410,1.0); key_scale(hero,430,0.001)
hero.location=(0,0,0.18); hero.keyframe_insert('location',frame=320); hero.keyframe_insert('location',frame=410); set_bezier(hero)

# Text cards
texts=[]
t1=make_text('人生瞬间，长久留存。','t1',0.42,2.75); show_text(t1,24,106,98); texts.append(t1)
t2=make_text('照片，也能大有可为。','t2',0.42,2.65); show_text(t2,112,176,168); texts.append(t2)
t3=make_text('咔蹦一下，蹦出立体世界。','t3',0.34,2.25); show_text(t3,152,218,210); texts.append(t3)
t4=make_text('回忆，也能有触感。','t4',0.46,2.65); show_text(t4,226,300,292); texts.append(t4)
t5=make_text('旅行。毕业。获奖。','t5',0.38,2.55); show_text(t5,292,360,352); texts.append(t5)
t6=make_text('每一个瞬间，都值得被立体珍藏。','t6',0.30,2.12); show_text(t6,342,414,406); texts.append(t6)
logo=make_text('咔蹦  SNAPPOP','logo',0.55,1.55); show_text(logo,438,END-12,END-20); texts.append(logo)
slogan=make_text('咔嚓一下，世界蹦出来。','slogan',0.34,0.92); show_text(slogan,455,END-6,END-14); texts.append(slogan)
# small top brand appears through the body
brand=make_text('SNAPPOP  /  MEMORY OBJECTS','brand',0.16,3.65,y=-0.16,color=(0.48,0.52,0.62)); show_text(brand,18,430,424); texts.append(brand)

# Hairline accent under key messages
line_mat = mat_principled('line_mat', (0.55,0.63,0.75), rough=0.25, emission=(0.30,0.45,0.9), emission_strength=0.3)
for idx,(start,end,z,width) in enumerate([(24,108,2.42,2.1),(112,176,2.33,1.7),(226,300,2.33,1.6),(292,414,2.24,2.0)]):
    bpy.ops.mesh.primitive_cube_add(location=(0,-0.12,z))
    ln=bpy.context.object; ln.name=f'accent_{idx}'; ln.scale=(0.001,0.008,0.008); ln.data.materials.append(line_mat)
    ln.keyframe_insert('scale',frame=start-5); ln.scale=(width,0.008,0.008); ln.keyframe_insert('scale',frame=start+8); ln.keyframe_insert('scale',frame=end-8); ln.scale=(0.001,0.008,0.008); ln.keyframe_insert('scale',frame=end+5); set_bezier(ln)

# Ambient audio strip if available
if audio_path and os.path.exists(audio_path):
    try:
        se = scene.sequence_editor_create()
        se.sequences.new_sound('snap_pop_ambient', audio_path, channel=1, frame_start=1)
    except Exception as e:
        print('AUDIO_STRIP_ERROR',e)

# Optimize and save editable source before rendering
frames_dir = os.path.splitext(out_path)[0] + '_frames'
os.makedirs(frames_dir, exist_ok=True)
scene.render.filepath = os.path.join(frames_dir, 'frame_')
bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(out_path)[0] + '.blend')
# Render
bpy.ops.render.render(animation=True)


