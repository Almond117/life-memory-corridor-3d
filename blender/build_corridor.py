import math
import os
import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "output")
os.makedirs(OUT, exist_ok=True)

COLORS = {
    "wall": (0.72, 0.52, 0.34, 1),
    "wall_light": (0.89, 0.72, 0.52, 1),
    "wood": (0.38, 0.17, 0.075, 1),
    "wood_light": (0.66, 0.36, 0.16, 1),
    "floor": (0.44, 0.21, 0.09, 1),
    "paper": (0.92, 0.84, 0.68, 1),
    "coral": (0.85, 0.30, 0.25, 1),
    "blue": (0.26, 0.52, 0.68, 1),
    "sage": (0.33, 0.52, 0.29, 1),
    "lavender": (0.52, 0.40, 0.70, 1),
    "mustard": (0.92, 0.64, 0.17, 1),
    "teal": (0.22, 0.55, 0.54, 1),
    "skin": (0.88, 0.56, 0.42, 1),
    "hair": (0.18, 0.09, 0.07, 1),
    "pants": (0.25, 0.38, 0.55, 1),
    "dark": (0.06, 0.04, 0.04, 1),
    "portal": (0.68, 0.34, 0.18, 1),
}


def material(name, color, roughness=0.75, metallic=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        specular = bsdf.inputs.get("Specular IOR Level") or bsdf.inputs.get("Specular")
        if specular:
            specular.default_value = 0.35
        if emission:
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


MATS = {name: material(name, color, 0.58 if name in {"floor", "wood", "wood_light"} else 0.72) for name, color in COLORS.items()}
MATS["lamp"] = material("lamp", (1.0, 0.72, 0.34, 1), 0.30, 0.10, (1.0, 0.40, 0.08, 1), 4.0)
MATS["light_strip"] = material("light_strip", (1.0, 0.50, 0.18, 1), 0.30, 0.0, (1.0, 0.32, 0.06, 1), 3.0)
MATS["brass"] = material("brass", (0.64, 0.36, 0.09, 1), 0.35, 0.65)
MATS["photo_1"] = material("photo_1", (0.18, 0.43, 0.62, 1), 0.9)
MATS["photo_2"] = material("photo_2", (0.74, 0.29, 0.24, 1), 0.9)
MATS["photo_3"] = material("photo_3", (0.82, 0.56, 0.16, 1), 0.9)
MATS["portal"] = material("portal", COLORS["portal"], 0.55, 0.0, (1.0, 0.25, 0.08, 1), 1.4)


def link(obj, collection=None):
    (collection or bpy.context.collection).objects.link(obj)
    return obj


def cube(name, location, scale, mat, bevel=0.0, collection=None):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("soft edges", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    if mat:
        obj.data.materials.append(mat)
    if collection and obj.name not in collection.objects:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def sphere(name, location, radius, mat, scale=(1, 1, 1), collection=None, segments=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(6, segments // 2), radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if collection and obj.name not in collection.objects:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def cylinder(name, location, radius, depth, mat, vertices=12, collection=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if collection and obj.name not in collection.objects:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def parent_all(objects, name, collection=None):
    root = bpy.data.objects.new(name, None)
    (collection or bpy.context.collection).objects.link(root)
    for obj in objects:
        obj.parent = root
    return root


def make_floor_asset(at=(0, 0, 0), collection=None):
    objs = []
    for index in range(5):
        plank = cube("floor_plank", (at[0] + (index - 2) * 0.42, at[1], at[2]), (0.38, 0.16, 1.35), MATS["wood_light" if index % 2 else "floor"], 0.035, collection)
        objs.append(plank)
    return parent_all(objs, "ASSET_FloorPlank", collection)


def make_wall_asset(at=(0, 0, 0), collection=None):
    body = cube("wall_panel", at, (1.35, 2.3, 0.18), MATS["wall_light"], 0.05, collection)
    inset = cube("wall_accent", (at[0], at[1] + 0.05, at[2] - 0.1), (0.45, 1.10, 0.04), MATS["coral"], 0.04, collection)
    trim_top = cube("wall_trim", (at[0], at[1] + 1.18, at[2]), (1.5, 0.12, 0.25), MATS["wood_light"], 0.03, collection)
    trim_bottom = cube("wall_trim", (at[0], at[1] - 1.18, at[2]), (1.5, 0.12, 0.25), MATS["wood_light"], 0.03, collection)
    return parent_all([body, inset, trim_top, trim_bottom], "ASSET_WallPanel", collection)


def make_beam_asset(at=(0, 0, 0), collection=None):
    beam = cube("ceiling_beam", at, (2.6, 0.22, 0.28), MATS["wood"], 0.05, collection)
    cap_a = cube("beam_cap", (at[0] - 1.18, at[1], at[2]), (0.16, 0.34, 0.4), MATS["wood_light"], 0.03, collection)
    cap_b = cube("beam_cap", (at[0] + 1.18, at[1], at[2]), (0.16, 0.34, 0.4), MATS["wood_light"], 0.03, collection)
    return parent_all([beam, cap_a, cap_b], "ASSET_CeilingBeam", collection)


def make_frame_asset(at=(0, 0, 0), collection=None, photo_mat=None):
    photo_mat = photo_mat or MATS["photo_1"]
    objs = []
    objs.append(cube("photo", (at[0], at[1], at[2] - 0.09), (1.6, 1.36, 0.08), photo_mat, 0.02, collection))
    for loc, scale in [
        ((at[0], at[1] + 0.78, at[2]), (1.78, 0.12, 0.16)),
        ((at[0], at[1] - 0.78, at[2]), (1.78, 0.12, 0.16)),
        ((at[0] - 0.83, at[1], at[2]), (0.12, 1.6, 0.16)),
        ((at[0] + 0.83, at[1], at[2]), (0.12, 1.6, 0.16)),
    ]:
        objs.append(cube("frame", loc, scale, MATS["wood_light"], 0.03, collection))
    return parent_all(objs, "ASSET_PictureFrame", collection)


def make_plaque_asset(at=(0, 0, 0), collection=None):
    base = cube("plaque_base", at, (1.25, 0.55, 0.12), MATS["paper"], 0.035, collection)
    mount = cube("plaque_mount", (at[0], at[1] - 0.34, at[2] + 0.04), (1.45, 0.12, 0.32), MATS["wood"], 0.025, collection)
    for x in (-0.52, 0.52):
        sphere("brass_pin", (at[0] + x, at[1], at[2] - 0.08), 0.045, MATS["brass"], collection=collection, segments=8)
    return parent_all([base, mount], "ASSET_CaptionPlaque", collection)


def make_plant_asset(at=(0, 0, 0), collection=None):
    objs = [cylinder("plant_pot", (at[0], at[1] + 0.26, at[2]), 0.32, 0.52, MATS["coral"], 12, collection)]
    for index in range(7):
        angle = index / 7 * math.tau
        objs.append(sphere("plant_leaf", (at[0] + math.cos(angle) * 0.20, at[1] + 0.74 + (index % 3) * 0.14, at[2] + math.sin(angle) * 0.18), 0.21, MATS["sage" if index % 2 else "teal"], scale=(0.7, 1.25, 0.42), collection=collection, segments=8))
    return parent_all(objs, "ASSET_PottedPlant", collection)


def make_shelf_asset(at=(0, 0, 0), collection=None):
    objs = [cube("shelf_board", (at[0], at[1] + 0.18, at[2]), (1.45, 0.12, 0.48), MATS["wood_light"], 0.03, collection)]
    books = [("coral", -0.42), ("blue", 0.0), ("mustard", 0.40)]
    for mat_name, x in books:
        objs.append(cube("book", (at[0] + x, at[1] + 0.50, at[2]), (0.27, 0.54, 0.34), MATS[mat_name], 0.035, collection))
    return parent_all(objs, "ASSET_BookShelf", collection)


def make_bench_asset(at=(0, 0, 0), collection=None):
    objs = [cube("bench_seat", (at[0], at[1] + 0.62, at[2]), (1.65, 0.24, 0.62), MATS["coral"], 0.12, collection)]
    for x in (-0.58, 0.58):
        objs.append(cube("bench_leg", (at[0] + x, at[1] + 0.28, at[2]), (0.12, 0.56, 0.38), MATS["wood"], 0.03, collection))
    return parent_all(objs, "ASSET_Bench", collection)


def make_lamp_asset(at=(0, 0, 0), collection=None):
    rod = cylinder("lamp_rod", (at[0], at[1] + 0.48, at[2]), 0.035, 0.95, MATS["brass"], 12, collection)
    cap = cylinder("lamp_cap", (at[0], at[1] + 0.98, at[2]), 0.18, 0.12, MATS["brass"], 16, collection)
    shade = sphere("lamp_shade", (at[0], at[1], at[2]), 0.30, MATS["lamp"], scale=(1.0, 0.58, 1.0), collection=collection, segments=16)
    return parent_all([rod, cap, shade], "ASSET_PendantLamp", collection)


def make_timeline_asset(at=(0, 0, 0), collection=None):
    line = cube("timeline_line", at, (1.50, 0.035, 0.05), MATS["paper"], 0.01, collection)
    node = cylinder("timeline_node", (at[0] - 0.52, at[1] + 0.07, at[2]), 0.16, 0.08, MATS["coral"], 20, collection)
    plaque = cube("timeline_year", (at[0] + 0.36, at[1] + 0.07, at[2]), (0.72, 0.16, 0.06), MATS["paper"], 0.02, collection)
    return parent_all([line, node, plaque], "ASSET_TimelineMarker", collection)


def make_globe_asset(at=(0, 0, 0), collection=None):
    sphere_obj = sphere("globe", (at[0], at[1] + 0.55, at[2]), 0.46, MATS["blue"], collection=collection, segments=16)
    ring = bpy.ops.mesh.primitive_torus_add(major_radius=0.58, minor_radius=0.035, major_segments=24, minor_segments=6, location=(at[0], at[1] + 0.55, at[2]))
    ring_obj = bpy.context.object
    ring_obj.name = "globe_ring"
    ring_obj.rotation_euler.x = math.radians(55)
    ring_obj.data.materials.append(MATS["brass"])
    stand = cylinder("globe_stand", (at[0], at[1] + 0.16, at[2]), 0.08, 0.42, MATS["brass"], 12, collection)
    return parent_all([sphere_obj, ring_obj, stand], "ASSET_Globe", collection)


def make_avatar_asset(at=(0, 0, 0), collection=None):
    objs = []
    objs.append(sphere("avatar_head", (at[0], at[1] + 1.55, at[2]), 0.34, MATS["skin"], scale=(0.95, 1.0, 0.88), collection=collection, segments=12))
    objs.append(sphere("avatar_hair", (at[0], at[1] + 1.74, at[2] + 0.02), 0.36, MATS["hair"], scale=(1.0, 0.65, 0.92), collection=collection, segments=12))
    objs.append(cube("avatar_body", (at[0], at[1] + 0.90, at[2]), (0.55, 0.65, 0.42), MATS["coral"], 0.12, collection))
    objs.append(cube("avatar_backpack", (at[0], at[1] + 0.98, at[2] + 0.27), (0.48, 0.58, 0.18), MATS["sage"], 0.08, collection))
    for x in (-0.14, 0.14):
        objs.append(cube("avatar_leg", (at[0] + x, at[1] + 0.39, at[2]), (0.18, 0.45, 0.22), MATS["pants"], 0.06, collection))
        objs.append(sphere("avatar_shoe", (at[0] + x, at[1] + 0.12, at[2] - 0.07), 0.13, MATS["paper"], scale=(1.0, 0.55, 1.25), collection=collection, segments=10))
    return parent_all(objs, "ASSET_ClayAvatar", collection)


ASSET_BUILDERS = [
    make_floor_asset, make_wall_asset, make_beam_asset, make_frame_asset,
    make_plaque_asset, make_plant_asset, make_shelf_asset, make_bench_asset,
    make_lamp_asset, make_timeline_asset, make_globe_asset, make_avatar_asset,
]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_render(camera_location, target, ortho=False, lens=48):
    bpy.context.scene.render.engine = "BLENDER_EEVEE"
    scene = bpy.context.scene
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    # Lift ambient exposure so unlit gaps still read as warm wood.
    scene.world.color = (0.09, 0.055, 0.035)
    scene.world.use_nodes = True
    world_bg = scene.world.node_tree.nodes.get("Background")
    if world_bg:
        world_bg.inputs["Color"].default_value = (0.09, 0.055, 0.035, 1)
        world_bg.inputs["Strength"].default_value = 0.28
    scene.view_settings.exposure = 0.70
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    bpy.ops.object.camera_add(location=camera_location)
    camera = bpy.context.object
    camera.data.lens = lens
    if ortho:
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = 10.7
    look_at(camera, target)
    scene.camera = camera
    return camera


def add_area_light(name, location, energy, color, size=5.0):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.shape = "DISK"
    light.data.size = size
    light.data.use_shadow = True
    return light


def add_point_light(name, location, energy, color, radius=2.5, shadow=False):
    bpy.ops.object.light_add(type="POINT", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.shadow_soft_size = radius
    light.data.use_shadow = shadow
    return light


def add_wall_wash(name, location, target, energy, color, size=3.5):
    """Soft area light aimed at a memory wall; non-shadowing keeps Eevee quick."""
    light = add_area_light(name, location, energy, color, size)
    light.data.use_shadow = False
    look_at(light, target)
    return light


def build_asset_library():
    clear_scene()
    collection = bpy.data.collections.new("ASSET_LIBRARY")
    bpy.context.scene.collection.children.link(collection)
    for index, builder in enumerate(ASSET_BUILDERS):
        x = (index % 4 - 1.5) * 2.75
        z = (1 - index // 4) * 2.45
        builder((x, 0, z), collection)
    add_area_light("AssetKey", (0, 2.8, 4), 850, (1.0, 0.78, 0.56), 6.0)
    add_area_light("AssetFill", (-4, 2.0, -3), 450, (0.45, 0.62, 1.0), 5.0)
    setup_render((0, 7.4, 10.8), (0, 0.5, 0), ortho=True)
    bpy.context.scene.render.filepath = os.path.join(OUT, "corridor_asset_library.png")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "corridor_asset_library.blend"))
    bpy.ops.render.render(write_still=True)


def build_corridor():
    clear_scene()
    scene = bpy.context.scene
    floor = cube("CORRIDOR_Floor", (0, -0.16, -9), (16, 0.32, 116), MATS["floor"])
    floor.data.materials.clear(); floor.data.materials.append(MATS["floor"])
    for z in [48 - i * 1.25 for i in range(93)]:
        cube("FloorPlank", (0, 0.02, z), (15.75, 0.035, 0.045), MATS["wood_light" if int(z) % 2 else "wood"], 0.01)
    for x in (-8.05, 8.05):
        cube("CORRIDOR_Wall", (x, 4.2, -9), (0.42, 8.8, 116), MATS["wall_light"])
    cube("CORRIDOR_Ceiling", (0, 8.6, -9), (16.3, 0.2, 116), MATS["wood"])
    for z in [45 - i * 5.5 for i in range(21)]:
        cube("CeilingBeam", (0, 8.28, z), (16.25, 0.23, 0.3), MATS["wood"])
        cube("LeftTrim", (-7.78, 4.1, z), (0.22, 8.3, 0.2), MATS["wood_light"])
        cube("RightTrim", (7.78, 4.1, z), (0.22, 8.3, 0.2), MATS["wood_light"])
    cube("Timeline", (0, 0.04, -8), (0.06, 0.04, 109), MATS["paper"])
    for index, z in enumerate([39 - i * 15.2 for i in range(7)]):
        accent = ["coral", "blue", "mustard", "lavender", "teal", "coral", "sage"][index]
        cylinder("TimelineNode", (0, 0.14, z), 0.14, 0.08, MATS[accent], 16)
        for side in (-1, 1):
            make_frame_asset((side * 7.55, 4.55, z + (0 if side < 0 else -7.1)), collection=None)
        make_plaque_asset((0, 0.30, z), collection=None)
    for z in [40 - i * 15.2 for i in range(7)]:
        make_plant_asset((-6.65, 0.05, z - 3.3))
        make_plant_asset((6.65, 0.05, z - 8.1))
        make_shelf_asset((-7.42, 2.2, z - 6.3))
        make_shelf_asset((7.42, 2.0, z - 9.5))
    make_bench_asset((4.8, 0, -6.65))
    make_bench_asset((-50.2, 0, 6.65))
    make_globe_asset((-6.55, 1.6, 24.8))
    make_globe_asset((6.55, 1.6, -39.2))
    # Keep the procedural avatar in the scene/GLB for the approved third-person
    # web mode; hide its parts only for the clean corridor preview render.
    avatar_root = make_avatar_asset((0, 0, 45))
    # A simple end portal gives the long perspective a clear destination.
    cube("EndWall", (0, 4.2, -66.0), (16.0, 8.8, 0.35), MATS["wall"])
    cube("EndPortal", (0, 4.0, -65.78), (7.2, 6.8, 0.08), MATS["dark"])
    cube("EndPortalGlow", (0, 4.0, -65.70), (6.55, 6.10, 0.06), MATS["portal"])
    # A continuous pair of low wall strips gives each memory bay a readable
    # warm edge and creates depth cues between the repeated frames.
    for z in [42 - i * 5.5 for i in range(20)]:
        for x in (-7.72, 7.72):
            cube("WallLightStrip", (x, 3.05, z), (0.07, 0.06, 3.0), MATS["light_strip"], 0.02)
    # A small number of shadow-casting practicals plus non-shadowing colour accents.
    # This keeps Eevee fast while giving the walls and floor a readable light rhythm.
    for index, z in enumerate([37 - i * 11 for i in range(10)]):
        # Add a visible fixture for every other practical; the existing point
        # lights remain the actual illumination source for faster Eevee renders.
        if index % 2 == 0:
            make_lamp_asset((0, 7.18, z))
        add_point_light(f"WarmPractical_{index}", (0, 6.7, z), 420, (1.0, 0.56, 0.28), 1.6, shadow=index in {0, 3, 6, 9})
        add_point_light(f"ColorAccent_{index}", ((-1) ** index * 5.5, 3.5, z - 3.2), 55, [(0.90, 0.40, 0.26), (0.60, 0.65, 0.80), (0.68, 0.52, 0.72)][index % 3], 1.8, shadow=False)
        add_wall_wash(f"LeftWash_{index}", (-6.7, 4.8, z + 1.8), (-7.8, 3.4, z), 110, (1.0, 0.54, 0.30), 2.8)
        add_wall_wash(f"RightWash_{index}", (6.7, 4.8, z - 1.8), (7.8, 3.4, z), 90, (0.78, 0.54, 0.36), 2.8)
    add_area_light("CorridorKey", (-3, 7.5, 25), 1500, (1.0, 0.70, 0.46), 9.0)
    add_area_light("CorridorFill", (3, 4.2, -18), 1050, (0.32, 0.48, 0.76), 8.0)
    # A gentle backlight gives the end arch a warm focal point.
    add_area_light("EndGlow", (0, 3.0, -60), 800, (1.0, 0.42, 0.20), 7.0)
    # Render from a human eye line and aim slightly down the floor; this
    # recovers the floor/timeline while keeping enough ceiling for enclosure.
    setup_render((0, 2.45, 51.5), (0, 1.65, 34.0), ortho=False, lens=38)
    bpy.context.scene.render.resolution_x = 1600
    bpy.context.scene.render.resolution_y = 900
    bpy.context.scene.render.filepath = os.path.join(OUT, "corridor_scene_preview.png")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "corridor_scene.blend"))
    avatar_parts = [avatar_root, *avatar_root.children_recursive]
    for avatar_part in avatar_parts:
        avatar_part.hide_render = True
    bpy.ops.render.render(write_still=True)
    for avatar_part in avatar_parts:
        avatar_part.hide_render = False
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "corridor_scene.blend"))
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "corridor_scene.glb"), export_format="GLB", export_materials="EXPORT")


build_asset_library()
build_corridor()
