p='C:/Users/Deivis_Pc/Desktop/proyectos/gymsync/backend/package.json'
s=open(p).read()
if '"version"' not in s:
    s=s.replace('"name": "@gymsync/backend",','"name": "@gymsync/backend",\n  "version": "1.0.0",',1)
open(p,'w').write(s)
print('ok' if '"version"' in s else 'MISSING')
PY