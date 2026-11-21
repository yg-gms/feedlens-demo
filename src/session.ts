import {defaults, posts, neutral, rank, replay} from './engine.ts'
import type {Interaction, Kind, Settings, Topic} from './engine.ts'

export function fresh() {
  return {
    seen:[posts[0]], selected:rank(neutral(),[],defaults)[0], round:1, seconds:0, playing:false, done:false, events:[] as Interaction[],
    settings:{...defaults}, nextId:1, revision:0, signalTopics:[] as Topic[],
    note:'Try liking this post. Watch which topic rises.',
  }
}
export type Session = ReturnType<typeof fresh>
export type Action =
  | {type:'reset'|'round'|'play'|'pause'|'tick'|'next'|'like'|'dislike'}
  | {type:'setting'; key:keyof Settings; value:number}
  | {type:'remove'; id:number}

export const currentPost = (s:Session)=>s.seen[s.seen.length-1]
const visit = (s:Session)=>(s.round-1)*posts.length+s.seen.length
export const reaction = (s:Session)=>s.events.find(e=>e.visit===visit(s) && (e.kind==='like'||e.kind==='dislike'))
function record(s:Session,kind:Kind):Session {
  const post = currentPost(s)
  const previous = kind==='like'||kind==='dislike' ? reaction(s) : undefined
  const events = previous ? s.events.filter(e=>e.id!==previous.id) : [...s.events]
  const last = events.at(-1)
  let nextId = s.nextId
  if (kind==='watch' && last?.kind==='watch' && last.visit===visit(s)) {
    events[events.length-1] = {...last,seconds:last.seconds+1}
  } else if (previous?.kind!==kind) {
    events.push({id:nextId++, postId:post.id, visit:visit(s), kind, seconds:kind==='watch'?1:s.seconds})
  }
  const note = previous?.kind===kind ? 'Reaction removed. Memory replayed.' :
    ({like:'Liked',dislike:'Disliked',skip:'Quick skip on',watch:'Watched '+(s.seconds+1)+'s of'})[kind]+' “'+post.title+'”.'
  return {...s,events,nextId,revision:s.revision+1,note,signalTopics:post.related?[post.topic,post.related]:[post.topic]}
}
export function update(s:Session,action:Action):Session {
  if (action.type==='reset') return fresh()
  if (action.type==='setting') {
    const settings = {...s.settings,[action.key]:action.value}
    const learning = ['watchTime','explicitFeedback','learningSpeed'].includes(action.key)
    return {...s,settings,signalTopics:[],note:learning?'Memory replayed with your learning settings.':'Upcoming posts ranked with your new settings.',revision:s.revision+1}
  }
  if (action.type==='remove') {
    if (!s.events.some(e=>e.id===action.id)) return s
    return {...s,events:s.events.filter(e=>e.id!==action.id),signalTopics:[],note:'Interaction removed. Memory replayed.',revision:s.revision+1}
  }
  if (action.type==='round' && s.done) {
    const first = rank(replay(s.events,s.settings),[],s.settings)[0]
    return {...s,seen:[first.post],selected:first,round:s.round+1,seconds:0,playing:false,done:false,signalTopics:[],note:'New round. Your learned interests carry over.'}
  }
  if (s.done) return s
  const post = currentPost(s)
  switch(action.type) {
    case 'like': case 'dislike': return record(s,action.type)
    case 'play': return {...s,playing:!s.playing && s.seconds<post.duration}
    case 'pause': return {...s,playing:false}
    case 'tick': {
      if (!s.playing) return s
      const seconds = s.seconds+1
      return {...record(s,'watch'),seconds,playing:seconds<post.duration}
    }
    case 'next': {
      const updated = !reaction(s) && s.seconds<3 ? record(s,'skip') : s
      const next = rank(replay(updated.events,s.settings),s.seen,s.settings)[0]
      if (!next) return {...updated,done:true,playing:false}
      return {...updated,seen:[...s.seen,next.post],selected:next,seconds:0,playing:false}
    }
    default:return s
  }
}
