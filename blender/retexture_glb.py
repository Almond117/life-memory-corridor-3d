import bpy, os, math
from mathutils import Vector

SRC = r"C:\Users\lanxi\Downloads\agentic_0005_pack_glb_model.glb"
OUT_DIR = r"D:\hks\blender\output"
os.makedirs(OUT_DIR, exist_ok=True)
BLEND_OUT = os.path.join(OUT_DIR, "agentic_0005_retextured.blend")
GLB_OUT = os.path.join(OUT_DIR, "agentic_0005_retextured.glb")
PNG_OUT = os.path.join(OUT_DIR, "agentic_0005_retextured_preview.png")

# Clean scene, then import user GLB.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# Palette based on the supplied Mediterranean warm arcade image.
PALETTE = {
    'plaster_warm': (0.92, 0.56, 0.38, 1.0),
    'plaster_gold': (0.98, 0.70, 0.36, 1.0),
    'plaster_blue': (0.43, 0.69, 0.73, 1.0),
    'plaster_rose': (0.90, 0.49, 0.57, 1.0),
    'wood': (0.43, 0.16, 0.055, 1.0),
    'wood_light': (0.68, 0.30, 0.10, 1.0),
    'floor': (0.34, 0.095, 0.028, 1.0),
    'stone': (0.76, 0.49, 0.27, 1.0),
    'rug': (0.56, 0.12, 0.055, 1.0),
    'rug_blue': (0.08, 0.24, 0.36, 1.0),
    'teal': (0.10, 0.43, 0.50, 1.0),
    'neutral': (0.62, 0.60, 0.55, 1.0),
}

def clear_nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    out.location=(560,0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location=(300,0)
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return nt, bsdf

def add_coords(nt):
    tc=nt.nodes.new('ShaderNodeTexCoord'); tc.location=(-900,50)
    # Generated works for UV and non-UV parts and keeps this pass robust.
    return tc.outputs['Generated']

TEXTURE_DIR = r"D:\\hks\\assets\\textures\\mediterranean-atlas"
TEXTURES = {
    'plaster': os.path.join(TEXTURE_DIR, 'terracotta-plaster.png'),
    'wood': os.path.join(TEXTURE_DIR, 'honey-walnut.png'),
    'floor': os.path.join(TEXTURE_DIR, 'terracotta-floor.png'),
    'rug': os.path.join(TEXTURE_DIR, 'woven-rug.png'),
    'teal': os.path.join(TEXTURE_DIR, 'teal-upholstery.png'),
    'stone': os.path.join(TEXTURE_DIR, 'cream-stone.png'),
}

def add_image_base(nt, bsdf, coord, filepath, scale=(1.0,1.0,1.0)):
    """Connect one of the generated material swatches as the base color."""
    if not os.path.exists(filepath):
        return False
    mp=nt.nodes.new('ShaderNodeMapping'); mp.location=(-720,40); mp.inputs['Scale'].default_value=scale; nt.links.new(coord,mp.inputs['Vector'])
    tex=nt.nodes.new('ShaderNodeTexImage'); tex.location=(-470,60); tex.image=bpy.data.images.load(filepath, check_existing=True); tex.interpolation='Linear'; tex.extension='REPEAT'; nt.links.new(mp.outputs['Vector'],tex.inputs['Vector']); nt.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    return True

def add_mapping(nt, coord, scale=(3.0,3.0,3.0)):
    mp=nt.nodes.new('ShaderNodeMapping'); mp.location=(-720,50)
    mp.inputs['Scale'].default_value=scale
    nt.links.new(coord, mp.inputs['Vector'])
    return mp.outputs['Vector']

def make_plaster(mat, base, scale=4.0):
    nt,bsdf=clear_nodes(mat); coord=add_mapping(nt,add_coords(nt),(scale,scale,scale))
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-520,90); noise.inputs['Scale'].default_value=2.6; noise.inputs['Detail'].default_value=3.0; noise.inputs['Roughness'].default_value=.7
    nt.links.new(coord, noise.inputs['Vector'])
    ramp=nt.nodes.new('ShaderNodeValToRGB'); ramp.location=(-280,100)
    c=Vector(base[:3]); lo=tuple(max(0.0,min(1.0,x*.72)) for x in c)+(1,); hi=tuple(max(0.0,min(1.0,x*1.18)) for x in c)+(1,)
    ramp.color_ramp.elements[0].color=lo; ramp.color_ramp.elements[1].color=hi
    nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.18; bump.inputs['Distance'].default_value=.11
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value=.78

def make_textured_plaster(mat, base, scale=4.0):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt)
    mp=nt.nodes.new('ShaderNodeMapping'); mp.location=(-720,40); mp.inputs['Scale'].default_value=(scale,scale,scale); nt.links.new(raw,mp.inputs['Vector'])
    tex=nt.nodes.new('ShaderNodeTexImage'); tex.location=(-500,80); tex.image=bpy.data.images.load(TEXTURES['plaster'], check_existing=True); tex.extension='REPEAT'; nt.links.new(mp.outputs['Vector'],tex.inputs['Vector'])
    bw=nt.nodes.new('ShaderNodeRGBToBW'); bw.location=(-300,-30); nt.links.new(tex.outputs['Color'],bw.inputs['Color'])
    tint=nt.nodes.new('ShaderNodeMixRGB'); tint.blend_type='MULTIPLY'; tint.inputs['Fac'].default_value=1.0; tint.inputs[1].default_value=base; tint.location=(-80,80); nt.links.new(bw.outputs['Val'],tint.inputs[2]); nt.links.new(tint.outputs['Color'],bsdf.inputs['Base Color'])
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-480,-120); noise.inputs['Scale'].default_value=5.5; noise.inputs['Detail'].default_value=3.0; noise.inputs['Roughness'].default_value=.75; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-120); bump.inputs['Strength'].default_value=.16; bump.inputs['Distance'].default_value=.075; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.82

def make_wood(mat, base, scale=(5.0,2.0,4.0), rough=.42):
    nt,bsdf=clear_nodes(mat); coord=add_mapping(nt,add_coords(nt),scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-520,100); noise.inputs['Scale'].default_value=3.2; noise.inputs['Detail'].default_value=2.0; noise.inputs['Roughness'].default_value=.58; nt.links.new(coord,noise.inputs['Vector'])
    wave=nt.nodes.new('ShaderNodeTexWave'); wave.location=(-520,-80); wave.wave_type='BANDS'; wave.bands_direction='X'; wave.inputs['Scale'].default_value=5.5; wave.inputs['Distortion'].default_value=6.0; wave.inputs['Detail'].default_value=3.0; nt.links.new(coord,wave.inputs['Vector'])
    mix=nt.nodes.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'; mix.inputs['Fac'].default_value=.68; mix.location=(-260,80); nt.links.new(noise.outputs['Fac'],mix.inputs[1]); nt.links.new(wave.outputs['Color'],mix.inputs[2])
    ramp=nt.nodes.new('ShaderNodeValToRGB'); ramp.location=(-30,80); c=Vector(base[:3]); lo=tuple(max(0.0,min(1.0,x*.42)) for x in c)+(1,); hi=tuple(max(0.0,min(1.0,x*1.45)) for x in c)+(1,); ramp.color_ramp.elements[0].color=lo; ramp.color_ramp.elements[1].color=hi; nt.links.new(mix.outputs['Color'],ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'],bsdf.inputs['Base Color'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(30,-100); bump.inputs['Strength'].default_value=.24; bump.inputs['Distance'].default_value=.12; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value=rough

def make_textured_wood(mat, base, scale=(2.0,2.0,2.0), rough=.42):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt); add_image_base(nt,bsdf,raw,TEXTURES['wood'],scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-460,-100); noise.inputs['Scale'].default_value=7.0; noise.inputs['Detail'].default_value=2.5; noise.inputs['Roughness'].default_value=.55; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.22; bump.inputs['Distance'].default_value=.09; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=rough

def make_textured_floor(mat, base, scale=(2.0,2.0,2.0)):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt); add_image_base(nt,bsdf,raw,TEXTURES['floor'],scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-460,-100); noise.inputs['Scale'].default_value=12.0; noise.inputs['Detail'].default_value=2.0; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.18; bump.inputs['Distance'].default_value=.075; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.38

def make_fabric(mat, base, scale=14):
    nt,bsdf=clear_nodes(mat); coord=add_mapping(nt,add_coords(nt),(scale,scale,scale))
    wave=nt.nodes.new('ShaderNodeTexWave'); wave.wave_type='BANDS'; wave.bands_direction='X'; wave.location=(-520,100); wave.inputs['Scale'].default_value=18; wave.inputs['Distortion'].default_value=2.0; wave.inputs['Detail'].default_value=2.0; nt.links.new(coord,wave.inputs['Vector'])
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-520,-80); noise.inputs['Scale'].default_value=24; noise.inputs['Detail'].default_value=2.0; nt.links.new(coord,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(20,-80); bump.inputs['Strength'].default_value=.34; bump.inputs['Distance'].default_value=.055; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
    bsdf.inputs['Base Color'].default_value=base; bsdf.inputs['Roughness'].default_value=.72

def make_textured_fabric(mat, base, scale=(8.0,8.0,8.0)):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt); add_image_base(nt,bsdf,raw,TEXTURES['teal'],scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-460,-100); noise.inputs['Scale'].default_value=32.0; noise.inputs['Detail'].default_value=2.0; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.28; bump.inputs['Distance'].default_value=.045; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.77

def make_rug(mat, base, border=False):
    nt,bsdf=clear_nodes(mat); coord=add_mapping(nt,add_coords(nt),(10,10,10))
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-500,80); noise.inputs['Scale'].default_value=28; noise.inputs['Detail'].default_value=2.0; nt.links.new(coord,noise.inputs['Vector'])
    ramp=nt.nodes.new('ShaderNodeValToRGB'); ramp.location=(-230,80); c=Vector(base[:3]); ramp.color_ramp.elements[0].color=tuple(max(0,x*.45) for x in c)+(1,); ramp.color_ramp.elements[1].color=tuple(min(1,x*1.3) for x in c)+(1,); nt.links.new(noise.outputs['Fac'],ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'],bsdf.inputs['Base Color'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(20,-100); bump.inputs['Strength'].default_value=.42; bump.inputs['Distance'].default_value=.09; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.88

def make_textured_rug(mat, base, scale=(2.0,2.0,2.0)):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt); add_image_base(nt,bsdf,raw,TEXTURES['rug'],scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-460,-100); noise.inputs['Scale'].default_value=30.0; noise.inputs['Detail'].default_value=2.0; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.38; bump.inputs['Distance'].default_value=.075; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.90

def make_stone(mat, base):
    nt,bsdf=clear_nodes(mat); coord=add_mapping(nt,add_coords(nt),(6,6,6))
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-500,80); noise.inputs['Scale'].default_value=4.2; noise.inputs['Detail'].default_value=5; noise.inputs['Roughness'].default_value=.8; nt.links.new(coord,noise.inputs['Vector'])
    ramp=nt.nodes.new('ShaderNodeValToRGB'); ramp.location=(-240,80); c=Vector(base[:3]); ramp.color_ramp.elements[0].color=tuple(max(0,x*.65) for x in c)+(1,); ramp.color_ramp.elements[1].color=tuple(min(1,x*1.25) for x in c)+(1,); nt.links.new(noise.outputs['Fac'],ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'],bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value=.56

def make_textured_stone(mat, base, scale=(3.0,3.0,3.0)):
    nt,bsdf=clear_nodes(mat); raw=add_coords(nt); add_image_base(nt,bsdf,raw,TEXTURES['stone'],scale)
    noise=nt.nodes.new('ShaderNodeTexNoise'); noise.location=(-460,-100); noise.inputs['Scale'].default_value=6.0; noise.inputs['Detail'].default_value=4.0; nt.links.new(raw,noise.inputs['Vector'])
    bump=nt.nodes.new('ShaderNodeBump'); bump.location=(40,-100); bump.inputs['Strength'].default_value=.18; bump.inputs['Distance'].default_value=.08; nt.links.new(noise.outputs['Fac'],bump.inputs['Height']); nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal']); bsdf.inputs['Roughness'].default_value=.64

def classify(name):
    n=name.lower()
    if 'floor' in n: return 'floor'
    if 'rug' in n: return 'rug_blue' if 'blue' in n or 'border' in n else 'rug'
    if 'bench padded' in n or 'upholstery' in n: return 'teal'
    if 'plaster' in n or 'ceiling' in n or 'wall' in n: return 'plaster_warm'
    if 'stone' in n or 'sill' in n or 'foundation' in n: return 'stone'
    if 'oak' in n or 'rail' in n or 'pilaster' in n or 'capital' in n or 'foot' in n or 'arch' in n or 'jamb' in n or 'trim' in n or 'bench leg' in n or 'seat frame' in n: return 'wood'
    return 'neutral'

# Replace material networks; existing material slots remain untouched.
for mat in bpy.data.materials:
    key=classify(mat.name)
    if key in {'plaster_warm'}: make_textured_plaster(mat,PALETTE[key])
    elif key=='floor': make_textured_floor(mat,PALETTE['floor'],(1.3,1.3,1.3))
    elif key=='wood': make_textured_wood(mat,PALETTE['wood'],(1.8,1.8,1.8),.42)
    elif key=='teal': make_textured_fabric(mat,PALETTE['teal'],(3.0,3.0,3.0))
    elif key=='rug': make_textured_rug(mat,PALETTE['rug'],(1.6,1.6,1.6))
    elif key=='rug_blue': make_textured_rug(mat,PALETTE['rug_blue'],(1.6,1.6,1.6))
    elif key=='stone': make_textured_stone(mat,PALETTE['stone'],(2.0,2.0,2.0))
    else:
        nt,bsdf=clear_nodes(mat); bsdf.inputs['Base Color'].default_value=PALETTE['neutral']; bsdf.inputs['Roughness'].default_value=.8
# Specific colored plaster material groups override warm default.
for name,key in [('Coral plaster','plaster_warm'),('Golden plaster','plaster_gold'),('Muted blue plaster','plaster_blue'),('Rose plaster','plaster_rose'),('Warm plaster','plaster_warm')]:
    mat=bpy.data.materials.get(name)
    if mat: make_textured_plaster(mat,PALETTE[key],3.5)

# Scene/world/light setup; no source scene data is overwritten on disk.
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.filepath=PNG_OUT
scene.render.film_transparent=False
if scene.world is None:
    scene.world=bpy.data.worlds.new('Mediterranean World')
scene.world.use_nodes=True
scene.world.color=(0.045,0.02,0.012)
if scene.world and scene.world.use_nodes:
    bg=scene.world.node_tree.nodes.get('Background')
    if bg: bg.inputs['Color'].default_value=(0.04,0.018,0.01,1); bg.inputs['Strength'].default_value=.22
# Remove imported lights; use a compact set to avoid shadow-buffer saturation.
for o in list(bpy.data.objects):
    if o.type=='LIGHT': bpy.data.objects.remove(o,do_unlink=True)
def area(name,loc,energy,color,size,rot=(0,0,0)):
    data=bpy.data.lights.new(name,'AREA'); data.energy=energy; data.color=color; data.shape='DISK'; data.size=size
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=rot; return o
def aim(o, point):
    o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
key=area('Sunset key',(2.5,-4.5,4.8),780,(1.0,.38,.18),5.5); aim(key,(0,5.0,1.6))
fill=area('Soft fill',(-3.8,2.0,3.8),380,(.35,.56,1.0),5.5); aim(fill,(0,5.0,2.2))
end=area('End glow',(0,12.0,3.1),700,(1.0,.48,.18),3.0); aim(end,(0,10.0,2.0))

# A small emissive sunset card makes the far opening readable in the render while
# keeping the source GLB geometry untouched. It can later be replaced by the user's
# own photograph or an AI-generated vista.
def sunset_card():
    mesh=bpy.data.meshes.new('Sunset vista mesh'); mesh.from_pydata([(-1.5,12.72,1.0),(1.5,12.72,1.0),(1.5,12.72,3.9),(-1.5,12.72,3.9)],[],[(0,1,2,3)]); mesh.update()
    obj=bpy.data.objects.new('Sunset vista placeholder',mesh); bpy.context.collection.objects.link(obj)
    mat=bpy.data.materials.new('Sunset vista'); mat.use_nodes=True; nt=mat.node_tree; nt.nodes.clear(); out=nt.nodes.new('ShaderNodeOutputMaterial'); em=nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value=(1.0,.24,.08,1); em.inputs['Strength'].default_value=1.15; nt.links.new(em.outputs['Emission'],out.inputs['Surface']); obj.data.materials.append(mat)
    return obj
sunset_card()
# Keep camera from imported GLB if present, otherwise create one.
cam=scene.camera
if cam is None:
    data=bpy.data.cameras.new('Camera'); cam=bpy.data.objects.new('Camera',data); bpy.context.collection.objects.link(cam); scene.camera=cam
# Reposition camera to center corridor, looking toward positive Y.
cam.location=(0.0,-0.05,2.35); cam.data.lens=30
def track(obj, point): obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
track(cam,(0,8.6,2.2))
# Add a subtle volumetric-free warm ceiling strip via emissive plane is unnecessary; area lights preserve performance.
scene.view_settings.look='AgX - Medium High Contrast'
bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
bpy.ops.render.render(write_still=True)
# Export all scene content, preserving the material node graphs in GLB.
bpy.ops.export_scene.gltf(filepath=GLB_OUT, export_format='GLB', export_materials='EXPORT', export_cameras=False, export_lights=False)
print('RETEXTURE_DONE',BLEND_OUT,GLB_OUT,PNG_OUT)


