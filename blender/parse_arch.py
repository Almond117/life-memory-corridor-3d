import struct,json,sys
p=sys.argv[-1]; b=open(p,'rb').read(); off=12
while off<len(b):
 l,t=struct.unpack_from('<II',b,off); d=b[off+8:off+8+l]; off+=8+l
 if t==0x4E4F534A: j=json.loads(d.decode('utf8')); break
for i,n in enumerate(j['nodes']):
 name=n.get('name','')
 if any(s.lower() in name.lower() for s in ['wall 1 bay 0','wall -1 bay 0','pilaster','transverse arch','capital','upper wall rail','lower plaster','rear wall','window jamb']):
  m=j['meshes'][n['mesh']]; vals=[]
  for prim in m['primitives']:
   a=j['accessors'][prim['attributes']['POSITION']]; vals.append((a.get('min'),a.get('max')))
  print(name,vals)
