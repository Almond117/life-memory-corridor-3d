import struct,json, numpy as np, pathlib
p=pathlib.Path(r'C:\Users\lanxi\Downloads\agentic_0003_pack_glb_model.glb')
b=p.read_bytes(); magic,ver,total=struct.unpack_from('<III',b,0); print('header',hex(magic),ver,total,len(b))
pos=12; chunks=[]
while pos<len(b):
 n,t=struct.unpack_from('<II',b,pos); pos+=8; chunks.append((t,b[pos:pos+n])); pos+=n
print('chunks',[(hex(t),len(d)) for t,d in chunks])
js=json.loads(next(d for t,d in chunks if t==0x4e4f534a).decode('utf-8'))
binchunk=next(d for t,d in chunks if t==0x004e4942)
print('asset',js.get('asset')); print('scenes',js.get('scenes')); print('scene',js.get('scene'))
print('nodes',len(js.get('nodes',[])),'meshes',len(js.get('meshes',[])),'materials',len(js.get('materials',[])))
for i,n in enumerate(js.get('nodes',[])):
 print('NODE',i,'name=',n.get('name'),'mesh=',n.get('mesh'),'children=',n.get('children'),'translation=',n.get('translation'),'rotation=',n.get('rotation'),'scale=',n.get('scale'),'matrix=',n.get('matrix'))
for i,m in enumerate(js.get('meshes',[])):
 print('MESH',i,m.get('name'),'prims',len(m.get('primitives',[])))
 for j,pr in enumerate(m.get('primitives',[])):
  print('  prim',j,'attrs',pr.get('attributes'),'mat',pr.get('material'))
ct={5120:(np.int8,1),5121:(np.uint8,1),5122:(np.int16,1),5123:(np.uint16,1),5125:(np.uint32,1),5126:(np.float32,1)}
numcomp={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT2':4,'MAT3':9,'MAT4':16}
def acc_values(ai):
 a=js['accessors'][ai]; bv=js['bufferViews'][a['bufferView']]; dt,sz=ct[a['componentType']]; nc=numcomp[a['type']]; start=(bv.get('byteOffset',0)+a.get('byteOffset',0)); stride=bv.get('byteStride',np.dtype(dt).itemsize*nc); out=[]
 for k in range(a['count']):
  raw=binchunk[start+k*stride:start+k*stride+np.dtype(dt).itemsize*nc]; out.append(np.frombuffer(raw,dtype=dt,count=nc))
 return np.array(out)
def mat4(n):
 if 'matrix' in n: return np.array(n['matrix'],dtype=float).reshape(4,4,order='F')
 T=np.eye(4); T[:3,3]=n.get('translation',[0,0,0])
 R=np.eye(4); x,y,z,w=n.get('rotation',[0,0,0,1]);
 R[:3,:3]=[[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w],[2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w],[2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y]]
 S=np.diag(list(n.get('scale',[1,1,1]))+[1.]); return T@R@S
def walk(ni,parent,namepath):
 n=js['nodes'][ni]; W=parent@mat4(n); nm=namepath+[n.get('name',f'node{ni}')]
 if n.get('mesh') is not None:
  mi=n['mesh']; allpts=[]
  for pr in js['meshes'][mi]['primitives']:
   ai=pr.get('attributes',{}).get('POSITION')
   if ai is not None:
    pts=acc_values(ai); h=np.c_[pts,np.ones(len(pts))]; w=(W@h.T).T[:,:3]; allpts.append(w)
  if allpts:
   pts=np.vstack(allpts); mn=pts.min(0); mx=pts.max(0)
   print('WORLD',ni,'/'.join(nm),'mesh',mi,js['meshes'][mi].get('name'),'min',mn,'max',mx,'size',mx-mn,'center',(mn+mx)/2)
 for c in n.get('children',[]): walk(c,W,nm)
roots=js['scenes'][js.get('scene',0)].get('nodes',[])
print('ROOTS',roots)
for r in roots: walk(r,np.eye(4),[])
for i,m in enumerate(js.get('materials',[])): print('MAT',i,m.get('name'),m.get('pbrMetallicRoughness'))
print('images',len(js.get('images',[])),'textures',len(js.get('textures',[])))
for i,img in enumerate(js.get('images',[])): print('IMG',i,img)
