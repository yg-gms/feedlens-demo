import {build} from 'vite'
import {readFile, writeFile} from 'node:fs/promises'
import {posts} from '../src/catalog.ts'

const dataURL = async (path,type) => 'data:'+type+';base64,'+(await readFile(path)).toString('base64')
const covers = Object.fromEntries(await Promise.all(posts.map(async post =>
  [post.id,await dataURL('public/art/'+post.id+'.webp','image/webp')])))
const logo = await dataURL('public/lens.svg','image/svg+xml')
const {output} = await build({publicDir:false,define:{__INLINE_COVERS__:JSON.stringify(covers)},
  build:{write:false,cssCodeSplit:false,modulePreload:false}})
const script = output.find(item=>item.type==='chunk' && item.isEntry).code.replaceAll('"./lens.svg"',JSON.stringify(logo))
const css = output.find(item=>item.type==='asset' && item.fileName.endsWith('.css')).source
const html = (await readFile('index.html','utf8')).replace('href="/lens.svg"','href="'+logo+'"')
  .replace('</head>',()=>'<style>'+css+'</style></head>')
  .replace('<script type="module" src="/src/main.tsx"></script>',()=>'<script type="module">'+script.replaceAll('</script','<\\/script')+'</script>')
await writeFile('../FeedLens.html',html)
