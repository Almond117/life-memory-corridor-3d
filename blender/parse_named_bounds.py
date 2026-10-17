import struct,json,sys
p=sys.argv[-1]; b=open(p,'rb').read(); off=12
while off<len(b):
 l,t=struct.unpack_from('<II',b,off); d=b[off+8:off+8+l]; off+=8+l
 if t==0x4E4F534A: j=json.loads(d.decode('utf8')); break
for i,n in enumerate(j['nodes']):
 if any(s.lower() in n.get('name','').lower() for s in ['floor','timeline','plank','baseboard','rear wall','sunset']):
  m=j['meshes'][n['mesh']]; ps=[]
  for prim in m['primitives']:
   a=j['accessors'][prim['attributes']['POSITION']]; ps.append((a.get('min'),a.get('max')))
  print(i,n['name'],ps)
