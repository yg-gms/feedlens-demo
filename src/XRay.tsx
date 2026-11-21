import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import {art} from './art'
import {eventContribution, eventWeight, postById, rank, replay} from './engine'
import type {Parts, Ranked, Settings} from './engine'
import {Icon} from './Icon'
import {currentPost} from './session'
import type {Session} from './session'
import './behind.css'

const factors: [keyof Parts, keyof Settings, string, string][] = [
  ['relevance', 'personalization', 'Interest match', 'Matches the main and related topics to your learned interests.'],
  ['popularity', 'popularity', 'Popularity', 'Uses a fixed popularity value assigned to each post.'],
  ['exploration', 'exploration', 'Exploration', 'Rewards topics you’ve seen less often this round.'],
  ['diversity', 'diversity', 'Diversity', 'Subtracts points for main topics repeated in the last three posts.'],
]
const number = (n:number) => (Math.abs(n)<.005?0:n).toFixed(2)
const signed = (n:number) => (n>=.005?'+':'')+number(n)
const verbs = {like:'Liked',dislike:'Disliked',watch:'Watched',skip:'Skipped'}

function Lead({rows}:{rows:Ranked[]}) {
  const [a,b] = rows
  if (!b) return <p>Only one candidate remains.</p>
  const gap = a.total-b.total
  if (gap<1e-10) return <p>The leaders tie. Their original catalog order breaks the tie.</p>
  const [key,,label] = factors.reduce((best,f)=>a.parts[f[0]]-b.parts[f[0]]>a.parts[best[0]]-b.parts[best[0]]?f:best)
  return <p><b>{label}</b> gives #1 its biggest edge over #2 ({signed(a.parts[key]-b.parts[key])}). The final gap is {gap<.005?'under 0.01':number(gap)} points.</p>
}

export function Behind({session:s,onChange,target}:{session:Session;onChange:(key:keyof Settings,value:number)=>void;target:string|null}) {
  const [picked,setPicked] = useState(target)
  const [all,setAll] = useState(false)
  const current = currentPost(s)
  const inspectCurrent = target===current.id
  const rows = useMemo(()=>rank(replay(s.events,s.settings),inspectCurrent?s.seen.slice(0,-1):s.seen,s.settings),[s.events,s.settings,s.seen,inspectCurrent])
  const index = Math.max(0,rows.findIndex(r=>r.post.id===picked))
  const row = rows[index]
  const visible = rows.filter((_,i)=>all || i<5 || i===index)
  const list = useRef<HTMLDivElement>(null)
  const previous = useRef(new Map<string,number>())
  useLayoutEffect(()=>{
    const positions = new Map<string,number>()
    for (const el of Array.from(list.current?.children??[]) as HTMLElement[]) {
      const id = el.dataset.id!, top = el.offsetTop
      positions.set(id,top)
      const last = previous.current.get(id)
      if (last!==undefined && last!==top && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.getAnimations().forEach(a=>a.cancel())
        el.animate([{transform:'translateY('+(last-top)+'px)'},{transform:'translateY(0)'}],{duration:300,easing:'ease-out'})
      }
    }
    previous.current = positions
  },[rows,all,index])

  if (!row) return <section className="bx-empty panel"><Icon name="queue"/><h2>The queue is empty</h2><p>Start another round in Your Feed to see fresh rankings.</p></section>
  const historical = inspectCurrent && row.post.id===current.id
  const peak = Math.max(.01,...Object.values(row.parts).map(Math.abs))
  const strongest = s.events.map(event=>({event,value:eventContribution(row.post,event,s.settings)}))
    .reduce<{event:Session['events'][number];value:number}|undefined>((best,next)=>Math.abs(next.value)>Math.abs(best?.value??0)?next:best,undefined)
  return <div className="bx">
    <div className="bx-grid">
      <section className="panel bx-board">
        <header><h2><span className="heading-icon lilac"><Icon name="queue"/></span>Candidate rankings</h2><span>{rows.length} posts</span></header>
        <p className="bx-context">{inspectCurrent?'The candidates your current post competed against, rescored with your latest signals and settings.':'The unseen posts competing for your next spot. Select one to inspect its score.'}</p>
        <div className="bx-list" ref={list}>{visible.map(r=><button key={r.post.id} data-id={r.post.id} aria-pressed={r===row} onClick={()=>setPicked(r.post.id)}>
          <span className="bx-rank">{String(rows.indexOf(r)+1).padStart(2,'0')}</span><img src={art(r.post)} alt=""/>
          <span className="bx-title"><b>{r.post.title}</b><small>{r.post.topic}</small></span><strong>{number(r.total)}<small>points</small></strong>
        </button>)}</div>
        {rows.length>5 && <button className="bx-more" onClick={()=>setAll(!all)} aria-expanded={all}>{all?'Show top five':'Show all '+rows.length+' candidates'} <Icon name="chevron" size={15}/></button>}
        <div className="bx-lead"><Icon name="spark" size={19}/><Lead rows={rows}/></div>
      </section>
      <section className="panel bx-inspector">
        <header><h2><span className="heading-icon mint"><Icon name="scan"/></span>Recommendation X-Ray</h2></header>
        <div className="bx-cover"><img src={art(row.post)} alt=""/><div><small>#{index+1} · {row.post.topic}{row.post.related?' + '+row.post.related:''}</small><h3>{row.post.title}</h3></div></div>
        <div className="bx-score"><span>Live score</span><strong>{number(row.total)} <small>pts</small></strong></div>
        <div className="bx-parts">{factors.map(([key,,label])=><div key={key}><span>{label}</span><span className="bx-track"><i className={row.parts[key]<0?'negative':''} style={{width:Math.abs(row.parts[key])/peak*50+'%'}}/></span><b>{signed(row.parts[key])}</b></div>)}</div>
        {historical && <details className="bx-detail"><summary>When this post was selected</summary><p>It ranked #1 with {number(s.selected.total)} points. Its score then included {factors.map(([key,,label])=>label.toLowerCase()+' '+signed(s.selected.parts[key])).join(', ')}.</p></details>}
        <details className="bx-detail"><summary>How your actions become interests</summary>
          {strongest ? <>
            <p>Your strongest signal for this post</p>
            <ol className="bx-path">
              <li><small>Action</small><b>{verbs[strongest.event.kind]} “{postById.get(strongest.event.postId)!.title}”{strongest.event.kind==='watch'?' for '+strongest.event.seconds+'s':''}</b></li>
              <li><small>Learned interest</small><b>{postById.get(strongest.event.postId)!.topic} {signed(eventWeight(strongest.event,s.settings))}</b></li>
              <li><small>Points for this post</small><b>{signed(strongest.value)} interest match</b></li>
            </ol></> : <p>{s.events.length?'Your recorded actions currently add zero interest-match points for this post.':'Like, watch, dislike or skip a post in Your Feed to give the model its first signal.'}</p>}
          <p>An action changes the main topic’s interest. A related topic receives a quarter of that change. Personalization scales the final match.</p>
        </details>
      </section>
    </div>
    <section className="panel bx-tune"><header><h2><span className="heading-icon peach"><Icon name="sliders"/></span>Tune the ranking</h2></header>
      <p className="bx-context">Move a slider to change the scores here and in Your Feed.</p>
      <div className="bx-sliders">{factors.map(([key,setting,label,description])=><label key={key}><span>{label}<b>{s.settings[setting]}%</b></span><input type="range" min="0" max="100" value={s.settings[setting]} onChange={e=>onChange(setting,Number(e.target.value))}/><small>{description}</small></label>)}</div>
    </section>
  </div>
}
