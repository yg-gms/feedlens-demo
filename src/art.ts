import type {Post} from './catalog'
// The portable build supplies the same images as data URLs.
declare const __INLINE_COVERS__: Record<string,string> | undefined
export const art = (post:Post) => typeof __INLINE_COVERS__ === 'undefined'
  ? './art/'+post.id+'.webp'
  : __INLINE_COVERS__[post.id]
