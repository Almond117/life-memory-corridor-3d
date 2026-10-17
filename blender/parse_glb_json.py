import struct, json, sys
p=sys.argv[-1]
b=open(p,'rb').read(); magic,ver,total=struct.unpack_from('<4sII',b,0); off=12
while off<len(b):
 l,t=struct.unpack_from('<II',b,off); d=b[off+8:off+8+l]; off+=8+l
 if t==0x4E4F534A:
  j=json.loads(d.decode('utf8')); break
print('asset',j.get('asset')); print('scenes',j.get('scene'),j.get('scenes'))
for i,n in enumerate(j.get('nodes',[])):
 if i<15 or n.get('name') in ('Cube','Cube_export','RootNode'):
  print('node',i,n)
