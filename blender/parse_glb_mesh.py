import struct,json,sys
p=sys.argv[-1]; b=open(p,'rb').read(); off=12
while off<len(b):
 l,t=struct.unpack_from('<II',b,off); d=b[off+8:off+8+l]; off+=8+l
 if t==0x4E4F534A: j=json.loads(d.decode('utf8')); break
for i,n in enumerate(j['nodes'][:10]):
 m=j['meshes'][n['mesh']]; prim=m['primitives'][0]; acc=j['accessors'][prim['attributes']['POSITION']]; print(i,n['name'],'pos minmax',acc.get('min'),acc.get('max'))
