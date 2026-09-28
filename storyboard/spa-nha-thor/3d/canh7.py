"""Cảnh 7 bản 3D (phong cách hoạt hình mềm): "Mụn nhiều hơn. Da đỏ hơn."

Chạy:  python3 3d/canh7.py [khung_đầu khung_cuối bước] [--samples N] [--scale %]
Ảnh ra: build/3d/f0000.png ...  (30 khung/giây)
"""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

DIR = Path(__file__).resolve().parent.parent
OUT = DIR / 'build/3d'
OUT.mkdir(parents=True, exist_ok=True)

args = [a for a in sys.argv[1:]]
opt = {'--samples': 28, '--scale': 100}
for k in list(opt):
    if k in args:
        i = args.index(k); opt[k] = int(args[i + 1]); del args[i:i + 2]
FPS, DUR = 30, 11.16
N = round(DUR * FPS)
f0, f1, step = (int(a) for a in args[:3]) if len(args) >= 3 else (0, N - 1, 1)

# Mốc lời đọc (giây trong cảnh) — khớp timeline.json
L1, L2, L3, L4 = 0.40, 1.69, 2.97, 6.47

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = opt['--samples']
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.resolution_percentage = opt['--scale']
sc.render.fps = FPS
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Punchy'


def lin(hexcol):
    """Mã màu sRGB -> màu tuyến tính cho Blender."""
    h = hexcol.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4)
    return (*out, 1)


def material(name, col, rough=.6, sheen=0., coat=0., transmission=0.):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin(col) if isinstance(col, str) else col
    b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Transmission Weight'].default_value = transmission
    return m


def link(ob, parent=None):
    if ob.name not in sc.collection.objects:
        sc.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def sphere(name, loc, scale, mat, parent=None, rot=None, seg=48):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location, ob.scale = loc, scale
    if rot is not None:
        ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = rot
    me.materials.append(mat)
    return link(ob, parent)


def rounded_box(name, loc, size, mat, bevel=.12, parent=None):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location, ob.scale = loc, size
    me.materials.append(mat)
    link(ob, parent)
    bv = ob.modifiers.new('bevel', 'BEVEL'); bv.width = bevel; bv.segments = 6; bv.affect = 'EDGES'
    bv.use_clamp_overlap = True
    ob.modifiers.new('smooth', 'SUBSURF').levels = 1
    for p in me.polygons:
        p.use_smooth = True
    return ob


def stroke(name, pts, r, mat, parent=None):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 6; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(name, cu)
    cu.materials.append(mat)
    return link(ob, parent)


def cylinder(name, loc, r, h, mat, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=h, location=loc)
    ob = bpy.context.active_object; ob.name = name
    ob.data.materials.append(mat)
    bv = ob.modifiers.new('bevel', 'BEVEL'); bv.width = min(r, h) * .25; bv.segments = 5
    bpy.ops.object.shade_smooth()
    if parent:
        ob.parent = parent
    return ob


# ---------- Vật liệu ----------
SKIN, HAIR = '#F4CDB0', '#3A2A24'
m_hair = material('toc', HAIR, rough=.62, sheen=.35)
m_shirt = material('ao', '#E4CFC1', rough=.8, sheen=.6)
m_eye = material('mat', '#1E1614', rough=.15, coat=.6)
m_white = material('trang', '#FFFFFF', rough=.2)
m_line = material('net', '#3A2320', rough=.5)
m_acne = material('mun', '#B8382C', rough=.45, coat=.15)
m_tear = material('nuoc-mat', '#BFE0F2', rough=.05, transmission=.7, coat=1)
m_neck = material('co', '#E2AE8E', rough=.6)
m_skin_plain = material('da', SKIN, rough=.55, sheen=.25)

# Da mặt: má hồng mềm + vùng đỏ lan dần, vẽ bằng mặt nạ khoảng cách (không có mép cứng)
HC, R = Vector((0, 0, 1.4)), .5


def surf(x, z, out=0.):
    dz = z - HC.z
    y = -math.sqrt(max(1e-4, R * R - x * x - dz * dz))
    return HC + Vector((x, y, dz)).normalized() * (R + out)


m_face = material('da-mat', SKIN, rough=.55, sheen=.25)
nt = m_face.node_tree
N_, L_ = nt.nodes, nt.links
tex = N_.new('ShaderNodeTexCoord')


def dist_mask(center, radius):
    d = N_.new('ShaderNodeVectorMath'); d.operation = 'DISTANCE'
    d.inputs[1].default_value = center / R          # toạ độ vật thể của đầu là hình cầu bán kính 1
    L_.new(tex.outputs['Object'], d.inputs[0])
    mr = N_.new('ShaderNodeMapRange'); mr.interpolation_type = 'SMOOTHSTEP'
    mr.inputs['From Min'].default_value = 0; mr.inputs['From Max'].default_value = radius / R
    mr.inputs['To Min'].default_value = 1; mr.inputs['To Max'].default_value = 0
    L_.new(d.outputs['Value'], mr.inputs['Value'])
    return mr.outputs['Result']


def combine(a, b, op='MAXIMUM'):
    m = N_.new('ShaderNodeMath'); m.operation = op
    L_.new(a, m.inputs[0]); L_.new(b, m.inputs[1])
    return m.outputs['Value']


def mix(col_a, col_b, fac):
    m = N_.new('ShaderNodeMix'); m.data_type = 'RGBA'
    if isinstance(col_a, tuple):
        m.inputs['A'].default_value = col_a
    else:
        L_.new(col_a, m.inputs['A'])
    m.inputs['B'].default_value = col_b
    if isinstance(fac, float):
        m.inputs['Factor'].default_value = fac
    else:
        L_.new(fac, m.inputs['Factor'])
    return m.outputs['Result']


cheekL, cheekR = surf(-.25, 1.3) - HC, surf(.25, 1.3) - HC
blush = combine(dist_mask(cheekL, .11), dist_mask(cheekR, .11))
blush_f = N_.new('ShaderNodeMath'); blush_f.operation = 'MULTIPLY'; blush_f.inputs[1].default_value = .7
L_.new(blush, blush_f.inputs[0])
red_mask = combine(combine(dist_mask(cheekL, .24), dist_mask(cheekR, .24)),
                   combine(dist_mask(surf(0, 1.55) - HC, .13), dist_mask(surf(0, 1.16) - HC, .1)))
redness = N_.new('ShaderNodeValue'); redness.outputs[0].default_value = 0
red_f = combine(red_mask, redness.outputs[0], 'MULTIPLY')
c1 = mix(lin(SKIN), lin('#EE9C92'), blush_f.outputs['Value'])
c2 = mix(c1, lin('#D8453A'), red_f)
L_.new(c2, N_['Principled BSDF'].inputs['Base Color'])

# ---------- Nhân vật ----------
head_pivot = link(bpy.data.objects.new('dau-pivot', None))
head_pivot.location = (0, 0, .95)


def P(v):
    """Toạ độ thế giới -> toạ độ con của khớp cổ."""
    return Vector(v) - head_pivot.location


def on_face(name, x, z, scale, mat, out=0.):
    p = surf(x, z, out)
    n = (p - HC).normalized()
    return sphere(name, P(p), scale, mat, head_pivot, rot=n.to_track_quat('Y', 'Z'))


head = sphere('dau', P(HC), (R, R, R), m_face, head_pivot, seg=64)
on_face('mui', 0, 1.31, (.035, .02, .026), m_skin_plain, .002)

eyes = []
for sx in (-1, 1):
    e = on_face(f'mat{sx}', .17 * sx, 1.43, (.058, .03, .078), m_eye, -.004)
    eyes.append(e)
    on_face(f'sang{sx}', .17 * sx - .018, 1.455, (.017, .012, .017), m_white, .022)
    # Lông mày buồn: đầu trong cao hơn
    stroke(f'may{sx}', [P(surf(.27 * sx, 1.535, .006)), P(surf(.185 * sx, 1.56, .008)), P(surf(.1 * sx, 1.59, .006))], .011, m_line, head_pivot)
mouth = stroke('mieng', [P(surf(-.07, 1.2, .006)), P(surf(0, 1.228, .008)), P(surf(.07, 1.2, .006))], .012, m_line, head_pivot)

# Tóc: vỏ tóc khoét lộ mặt + mái hai bên + tóc dài phía sau
hair = sphere('toc-vo', P((0, .03, 1.44)), (.548, .548, .56), m_hair, head_pivot, seg=64)
cut = sphere('khoet', P((0, -.6, 1.1)), (.47, .55, .64), m_white, head_pivot)
cut.hide_render = True; cut.display_type = 'WIRE'
bo = hair.modifiers.new('khoet', 'BOOLEAN'); bo.operation = 'DIFFERENCE'; bo.object = cut
for sx in (-1, 1):
    sphere(f'mai{sx}', P((.18 * sx, -.44, 1.685)), (.2, .1, .085), m_hair, head_pivot,
           rot=Vector((0, -1, .35)).to_track_quat('Y', 'Z') @ Quaternion((0, 1, 0), .28 * sx))
    sphere(f'toc-ben{sx}', P((.47 * sx, -.02, 1.08)), (.12, .14, .38), m_hair, head_pivot)
rounded_box('toc-sau', P((0, .24, 1.05)), (1.08, .34, .9), m_hair, bevel=.16, parent=head_pivot)

# Thân
cylinder('co', (0, 0, .92), .12, .22, m_neck)
body = sphere('than', (0, .05, .44), (.4, .3, .5), m_shirt)
for sx in (-1, 1):
    arm = sphere(f'tay{sx}', (.42 * sx, 0, .45), (.1, .1, .28), m_shirt)
    arm.rotation_mode = 'XYZ'; arm.rotation_euler = (0, math.radians(-12 * sx), 0)
    sphere(f'ban-tay{sx}', (.47 * sx, -.03, .18), (.085, .085, .085), m_skin_plain)

# Mụn: bật lên lần lượt khi đọc "Mụn nhiều hơn"
ACNE = [(-.28, 1.33), (.27, 1.31), (-.2, 1.24), (.31, 1.4), (-.33, 1.41), (.18, 1.23), (-.05, 1.575), (.06, 1.565),
        (-.36, 1.27), (.36, 1.25), (.02, 1.12), (-.24, 1.49), (.25, 1.48), (.28, 1.17), (-.27, 1.16), (.1, 1.29)]
acne = [on_face(f'mun{i}', x, z, (.024, .024, .016), m_acne, -.004) for i, (x, z) in enumerate(ACNE)]

tear = on_face('nuoc-mat', .19, 1.36, (.026, .022, .036), m_tear, .012)

# ---------- Phòng ----------
m_wall = material('tuong', '#F1D6CC', rough=.9)
m_floor = material('san', '#E9C9BD', rough=.8)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -.02)); bpy.context.active_object.data.materials.append(m_floor)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 3.2, 0), rotation=(math.pi / 2, 0, 0)); bpy.context.active_object.data.materials.append(m_wall)
m_shelf = material('ke', '#FFF6EE', rough=.6)
rounded_box('ke', (1.35, 2.9, 1.35), (1.3, .35, .06), m_shelf, bevel=.02)
for i, col in enumerate(['#EDB9A6', '#8DA68A', '#C9A45C', '#D9735A', '#EDB9A6', '#FFFAF3']):
    x = .85 + i * .2
    h = .28 + (i % 3) * .08
    cylinder(f'lo{i}', (x, 2.9, 1.39 + h / 2), .07, h, material(f'lo-m{i}', col, rough=.35, coat=.5))
    cylinder(f'nap{i}', (x, 2.9, 1.39 + h + .03), .04, .06, material(f'nap-m{i}', '#2B2420', rough=.4))
m_win = material('cua-so', '#FFFFFF', rough=1)
m_win.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = lin('#FFE9D2')
win_em = m_win.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
win_em.default_value = 2.5
rounded_box('khung-cua', (-1.45, 3.15, 1.85), (1.05, .06, 1.35), m_shelf, bevel=.02)
bpy.ops.mesh.primitive_plane_add(size=1, location=(-1.45, 3.1, 1.85), rotation=(math.pi / 2, 0, 0))
w = bpy.context.active_object; w.scale = (.9, 1.2, 1); w.data.materials.append(m_win)
cylinder('chau', (-1.3, 2.2, .25), .22, .5, material('chau-m', '#D9735A', rough=.7))
for i, (dx, dz, r) in enumerate([(0, .75, .3), (-.18, .62, .2), (.2, .65, .22)]):
    sphere(f'la{i}', (-1.3 + dx, 2.2, dz), (r, r, r), material(f'la-m{i}', '#8DA68A', rough=.8))

# ---------- Ánh sáng ----------
world = bpy.data.worlds.new('world'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = lin('#F3DAD2')
world.node_tree.nodes['Background'].inputs[1].default_value = .45
target = link(bpy.data.objects.new('dich', None)); target.location = (0, 0, 1.35)


def area(name, loc, energy, size, col):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.size = size; ld.color = lin(col)[:3]
    ob = link(bpy.data.objects.new(name, ld)); ob.location = loc
    c = ob.constraints.new('TRACK_TO'); c.target = target; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    return ld


key = area('chinh', (-2.4, -3.2, 3.4), 520, 3.5, '#FFE6D4')
fill = area('phu', (2.6, -2.6, 1.6), 180, 4, '#FFD9D2')
rim = area('vien', (1.6, 2.2, 2.8), 260, 1.6, '#9B8CFF')

# ---------- Máy quay ----------
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 50; cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 36
cam = link(bpy.data.objects.new('cam', cam_d)); sc.camera = cam
look = link(bpy.data.objects.new('nhin', None))
tc = cam.constraints.new('TRACK_TO'); tc.target = look; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
cam_d.dof.use_dof = True; cam_d.dof.focus_object = head


# ---------- Diễn hoạt ----------
def clamp(v, a=0., b=1.):
    return max(a, min(b, v))


def ease(p):
    p = clamp(p)
    return p * p * (3 - 2 * p)


def back(p):
    p = clamp(p); c = 1.7
    return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2


def pose(t):
    # Máy quay: từ trung cảnh đẩy dần vào cận mặt, rung tay nhẹ
    k = ease(t / DUR)
    cam.location = Vector((0, -5.4, 1.12)).lerp(Vector((0, -2.35, 1.4)), k) + Vector(
        (math.sin(t * 1.3) * .012, 0, math.sin(t * 1.7 + 1) * .01))
    look.location = Vector((0, 0, 1.02)).lerp(Vector((0, 0, 1.36)), k)
    cam_d.dof.aperture_fstop = 2.2 + .8 * k
    # Đầu cúi dần, run nhẹ từ lúc nói đến tiền
    trem = ease((t - L3) / 1.5) * math.sin(t * 23) * .008
    head_pivot.rotation_euler = (.13 * ease(t / DUR), 0, trem + math.sin(t * .8) * .02)
    body.scale = (.4, .3, .5 * (1 + .012 * math.sin(t * 2.2)))
    # Chớp mắt
    blink = any(abs(t - b) < .07 for b in (2.3, 5.4, 8.8))
    for e in eyes:
        e.scale = (.058, .03, .078 * (.12 if blink else 1))
    # Miệng mếu run
    mouth.scale = (1, 1, 1 + .06 * math.sin(t * 17) * ease((t - L3) / 1.5))
    # Mụn bật lên
    for i, a in enumerate(acne):
        s = back((t - L1 - i * .09) / .35) if t >= L1 + i * .09 else 0
        a.scale = tuple(max(s * v, 1e-4) for v in (.024, .024, .016))
    # Da đỏ dần
    redness.outputs[0].default_value = .9 * ease((t - L2) / 1.4)
    # Nước mắt lăn xuống
    tt = clamp((t - 7.0) / 2.6)
    if t < 7.0:
        tear.scale = (1e-4,) * 3
    else:
        p = surf(.19 + .02 * tt, 1.36 - .19 * tt, .012)
        tear.location = P(p)
        tear.rotation_quaternion = (p - HC).normalized().to_track_quat('Y', 'Z')
        grow = back(clamp((t - 7.0) / .4))
        fade = 1 - ease((t - 9.3) / .5)
        tear.scale = tuple(max(1e-4, v * grow * fade) for v in (.026, .022, .036))
    # Không khí u ám dần khi nhạc bùng lên
    key.energy = 520 - 160 * ease((t - L3) / 4)
    rim.energy = 260 + 420 * ease((t - L1) / 3)
    win_em.default_value = 2.5 - 1.2 * ease((t - L3) / 4)


for f in range(f0, f1 + 1, step):
    pose(f / FPS)
    sc.frame_set(f)
    sc.render.filepath = str(OUT / f'f{f:04d}.png')
    bpy.ops.render.render(write_still=True)
    print(f'khung {f}/{N - 1}', flush=True)
