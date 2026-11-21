import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {posts, rank, replay} from './engine'
import type {Post} from './engine'
import {currentPost, fresh, reaction, update} from './session'
import {Icon} from './Icon'
import {art} from './art'
import {FeedControls, Lab} from './Lab'
import {TimeMachine} from './TimeMachine'
import {InterestProfile, NextQueue} from './LivePanels'
import {Behind} from './XRay'
import './style.css'
import './experience.css'
import './sections.css'

const time = (seconds:number) => '0:'+String(seconds).padStart(2,'0')

const sections = [
  {name:'Your Feed', icon:'feed', subtitle:'Watch, like, or skip a post. See what your feed learns from you.'},
  {name:'Behind the Feed', icon:'scan', subtitle:'Follow a signal from your history to the score that puts a post on top.'},
  {name:'Algorithm Lab', icon:'science', subtitle:'Make a prediction, change one variable, and see what the algorithm does.'},
  {name:'Time Machine', icon:'clock', subtitle:'Change one past interaction and compare the recommendations you get.'},
] as const
const sectionIds = ['feed','behind','lab','history']
const sectionFromHash = () => Math.max(0, sectionIds.indexOf(window.location.hash.slice(1)))

function App() {
  const [s,dispatch] = useReducer(update,undefined,fresh)
  const [sessionKey,setSessionKey] = useState(0)
  const [inspect,setInspect] = useState<string|null>(null)
  const [inspectionKey,setInspectionKey] = useState(0)
  const [section,setSection] = useState(sectionFromHash)
  const heading = useRef<HTMLHeadingElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const player = useRef<HTMLDivElement>(null)
  const signal = useRef<HTMLSpanElement>(null)
  const actionBar = useRef<HTMLDivElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const post = currentPost(s)
  const feedback = reaction(s)?.kind
  const profile = useMemo(()=>replay(s.events,s.settings),[s.events,s.settings])
  const queue = useMemo(()=>rank(profile,s.seen,s.settings),[profile,s.seen,s.settings])
  function navigate(page:number) {
    dispatch({type:'pause'})
    setSection(page)
    if (window.location.hash !== '#'+sectionIds[page]) window.location.hash = sectionIds[page]
    requestAnimationFrame(()=>{
      heading.current?.focus({preventScroll:true})
      window.scrollTo(0,0)
    })
  }
  useEffect(()=>{
    const change = () => {dispatch({type:'pause'});setSection(sectionFromHash())}
    window.addEventListener('hashchange',change)
    return ()=>window.removeEventListener('hashchange',change)
  },[])
  const next = () => dispatch({type:'next'})
  const reset = () => {setInspect(null);setSessionKey(key=>key+1);dispatch({type:'reset'});navigate(0)}
  const openXRay = (target:Post) => {setInspect(target.id);setInspectionKey(k=>k+1);navigate(1)}
  const onChange = (key:keyof typeof s.settings,value:number)=>dispatch({type:'setting',key,value})
  useEffect(() => {
    if (!s.playing) return
    const timer = window.setInterval(()=>dispatch({type:'tick'}),1000)
    const hide = () => {if (document.hidden) dispatch({type:'pause'})}
    document.addEventListener('visibilitychange',hide)
    const observer = new IntersectionObserver(([entry])=>{if (!entry.isIntersecting) dispatch({type:'pause'})})
    if (player.current) observer.observe(player.current)
    return () => {clearInterval(timer);document.removeEventListener('visibilitychange',hide);observer.disconnect()}
  },[s.playing])
  useEffect(() => {
    const el = player.current
    if (!el || s.done) return
    let last = -Infinity, distance = 0, fingerY = 0
    function wheel(e:WheelEvent) {
      if (e.ctrlKey || e.deltaY<=0 || Math.abs(e.deltaX)>e.deltaY) return
      e.preventDefault()
      if (performance.now()-last>200) distance=0
      last=performance.now()
      distance+=e.deltaY*(e.deltaMode===1?16:1)
      if (distance>50) {distance=-Infinity;next()}
    }
    function touchStart(e:TouchEvent) {fingerY=e.touches[0].clientY}
    function touchEnd(e:TouchEvent) {if(fingerY-e.changedTouches[0].clientY>60) next()}
    el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('touchstart',touchStart,{passive:true});el.addEventListener('touchend',touchEnd)
    return () => {el.removeEventListener('wheel',wheel);el.removeEventListener('touchstart',touchStart);el.removeEventListener('touchend',touchEnd)}
  },[s.done,sessionKey])
  useEffect(()=>{
    if (!s.signalTopics.length || !signal.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const source = actionBar.current?.getBoundingClientRect()
    const target = sidebar.current?.getBoundingClientRect()
    if (!source || !target || source.bottom<0 || target.top+45>innerHeight || source.top>innerHeight) return
    const x=source.right-20, y=source.top+15, dx=target.left+24-x, dy=target.top+27-y
    const dot=signal.current
    dot.style.left=x+'px'; dot.style.top=y+'px'
    const animation=dot.animate([{opacity:0,transform:'scale(.5)'},{opacity:.9,offset:.2},
      {opacity:0,transform:'translate('+dx+'px,'+dy+'px) scale(.6)'}],{duration:520,easing:'ease-out'})
    return ()=>animation.cancel()
  },[s.revision,s.signalTopics])
  return <>
    <header className="top"><div className="top-inner"><div className="brand"><img src="./lens.svg" alt=""/>FeedLens</div>
      <nav className="sections-nav" aria-label="Explore FeedLens">{sections.map((item,i)=><a key={item.name} href={'#'+sectionIds[i]} aria-current={section===i?'page':undefined}
        onClick={e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(i)}}><Icon name={item.icon} size={16}/>{item.name}</a>)}</nav>
      <div className="nav"><button className="help" aria-label="How it works" title="How it works" onClick={()=>{dispatch({type:'pause'});dialog.current?.showModal()}}><Icon name="help" size={19}/></button>
      <button className="reset" onClick={reset}><Icon name="reset" size={16}/>Reset<span className="wide"> session</span></button></div></div></header>
    <main key={sessionKey}><section className={'intro intro-'+section} key={section}><div>
      <h1 ref={heading} tabIndex={-1}>{sections[section].name}<span className="twinkle" aria-hidden="true">✦</span></h1>
      <p>{sections[section].subtitle}</p></div>
      <div className="section-stamp" aria-hidden="true"><Icon name={sections[section].icon} size={48}/></div>
      </section>
      <div hidden={section!==0}><div className="layout"><section className="left" aria-label="Feed">
        <article className="feed panel"><div className="feed-heading"><h2><span className="heading-icon lilac"><Icon name="feed" size={19}/></span>Now showing</h2>
          <span className="counter">{s.round>1?'Round '+s.round+' · ':''}Post <b>{String(s.seen.length).padStart(2,'0')}</b> / {posts.length}</span></div>
          {s.done ? <div className="finish"><Icon name="eye" size={44}/><h2>Round complete</h2><p>You’ve seen all {posts.length} posts. Start another round with the interests you’ve trained.</p><button className="reset" onClick={()=>dispatch({type:'round'})}><Icon name="play" size={16}/>Start new round</button></div> :
          <><div className="player" ref={player} aria-label={post.title}>
            <img key={post.id} className="poster" src={art(post)} alt="" style={{animationPlayState:s.playing?'running':'paused'}}/>
            <div className="shade"/><span className={'badge '+post.topic.toLowerCase()}><Icon name={post.topic.toLowerCase()} size={17}/>{post.topic}</span>
            <span className="duration"><Icon name="clock" size={14}/>{s.playing||s.seconds?time(s.seconds)+' / ':''}{time(post.duration)}</span>
            <div className="caption" key={post.id+'caption'}><span className="handle">@{post.creator}</span><h3>{post.title}</h3></div>
            <div className="progress"><i style={{width:100*s.seconds/post.duration+'%'}}/></div>
          </div>
          <div className="actions" ref={actionBar}><button className="skip" onClick={next}><Icon name="skip"/>{feedback||s.seconds>=3?'Next':'Skip'}</button>
          <button className="watch" disabled={s.seconds>=post.duration} onClick={()=>dispatch({type:'play'})}><Icon name={s.playing?'pause':'play'} size={17}/>{s.playing?'Pause':s.seconds>=post.duration?'Watched':'Watch'}</button>
          <button className={'like '+(feedback==='like'?'liked':'')} aria-pressed={feedback==='like'} onClick={()=>dispatch({type:'like'})}><Icon name="heart" size={19}/>{feedback==='like'?'Liked':'Like'}</button>
          <button className="dislike" aria-pressed={feedback==='dislike'} onClick={()=>dispatch({type:'dislike'})}><Icon name="dislike" size={17}/>{feedback==='dislike'?'Disliked':'Dislike'}</button></div>
          <button className="why" onClick={()=>openXRay(post)}><Icon name="scan" size={17}/>Why am I seeing this?<span aria-hidden="true">↗</span></button></>}
        </article>
        <FeedControls settings={s.settings} onChange={onChange} scope="feed"/>
      </section><aside ref={sidebar}>
        <InterestProfile profile={profile} note={s.note} revision={s.revision} signalTopics={s.signalTopics}/>
        <NextQueue queue={queue.map(row=>row.post)} onInspect={openXRay}/>
      </aside></div></div>
      <div hidden={section!==1}><Behind key={inspectionKey} session={s} onChange={onChange} target={inspect}/></div>
      <div hidden={section!==2}><Lab settings={s.settings} onChange={onChange}/></div>
      <div hidden={section!==3}><TimeMachine session={s}/></div>
    </main><span className="travel-signal" aria-hidden="true" ref={signal}/>
    <dialog aria-labelledby="help-title" ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current?.close()}}><div className="dialog-head"><h2 id="help-title">How FeedLens works</h2><button aria-label="Close" onClick={()=>dialog.current?.close()}><Icon name="close"/></button></div>
      <p>Like the opening post and look at <b>Up next</b>. Select a recommendation to see exactly how its tags and your reactions earned its rank.</p>
      <p><b>Watch</b> sends a signal each second. A dislike or a skip before three seconds lowers interest. Scroll down over the cover or swipe up to advance.</p>
      <p>Open <b>Algorithm Lab</b> to change how the feed learns and ranks. In <b>Time Machine</b>, branch from a past reaction to see how a different signal changes the rankings.</p></dialog>
  </>
}
createRoot(document.getElementById('root')!).render(<App/>)
