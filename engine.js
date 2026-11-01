const PAGE = window.PAGE || {};
/* ---------- Tunable @export values ---------- */
const EXP = /^@export var (\w+): (float|int) = (-?[\d.]+)/gm;
const VALS = R.map(r => { const o = {}; for (const m of r.code.matchAll(EXP)) o[m[1]] = {type:m[2], def:+m[3], v:+m[3]}; return o; });
function rangeFor(r, name, d){ if (r.ranges && r.ranges[name]) return r.ranges[name];
  const v=d.def, int=d.type==="int";
  if (v<0) return [Math.round(v*2.5), Math.round(v*0.2), int?1:5];
  const max = v===0?1:v*3, step = int?1:(v>=50?5:v>=5?0.5:0.01); return [0, +max.toFixed(2), step]; }
const fmt = (d,v) => d.type==="int" ? String(Math.round(v)) : (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
function codeOf(i){ const vals=VALS[i]; return R[i].code.replace(EXP,(m,n,ty)=>`@export var ${n}: ${ty} = ${fmt(vals[n],vals[n].v)}`); }
function P(i){ const o={}; for (const k in VALS[i]) o[k]=VALS[i][k].v; return o; }

/* ---------- Animated, interactive previews ---------- */
const ATLAS_SRC="data:image/png;base64,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";
const ATLAS_IDX={"p0": 0, "p1": 1, "q0": 2, "q1": 3, "e0": 4, "e1": 5, "b0": 6, "b1": 7, "g1": 8, "g2": 9, "g3": 10, "dirt": 11, "coin": 12, "coin2": 13, "heart": 14, "hhalf": 15, "hempty": 16, "key": 17, "f0": 18, "f1": 19, "pole": 20, "crate": 21, "blk": 22, "blkused": 23, "gem": 24, "spikes": 25, "mushroom": 26, "tree": 27, "cactus": 28, "bush": 29, "sign": 30};
const ATLAS=new Image(); ATLAS.src=ATLAS_SRC;
function spr(c,name,x,y,flip,sc){ sc=sc||1; const i=ATLAS_IDX[name]; if(i===undefined||!ATLAS.complete) return; c.imageSmoothingEnabled=false;
  const s=24*sc; c.save(); c.translate(Math.round(x),Math.round(y)); if(flip) c.scale(-1,1); c.drawImage(ATLAS,i*24,0,24,24,-s/2,-s,s,s); c.restore(); }
const walk=t=>Math.floor(t*7)%2?"p1":"p0", pink=t=>Math.floor(t*7)%2?"q1":"q0", spiky=t=>Math.floor(t*5)%2?"e1":"e0", bat=t=>Math.floor(t*8)%2?"b1":"b0", coin=t=>Math.floor(t*6)%2?"coin2":"coin", flag=t=>Math.floor(t*4)%2?"f1":"f0";
function ground(c,x0,x1,y){ const H=c.canvas.height; for(let x=x0;x<x1;x+=24){ const last=x+24>=x1, first=x===x0; spr(c,first?"g1":last?"g3":"g2",x+12,y+24); for(let yy=y+24;yy<y+200;yy+=24) spr(c,"dirt",x+12,yy+24); } }

const TAU = Math.PI*2;
const rnd = n => { const x = Math.sin(n*12.9898)*43758.5453; return x - Math.floor(x); };
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const mt = (a,b,d) => Math.abs(b-a)<=d ? b : a+Math.sign(b-a)*d;
const CK={ink:"#1b1830",muted:"#28466b",line:"#3e7fa3",acc:"#ffcc4d",panel:"#fff8e6",k:"#c42f4b",s:"#e0701a",n:"#1d4fb8",f:"#127a52",t:"#6b3fc9",bg:"#5fcde4"};
function C(){ return CK; }
function lbl(c,txt,x,y,col,align){ c.font="600 11px 'JetBrains Mono', ui-monospace, monospace"; c.fillStyle=col; c.textAlign=align||"left"; c.textBaseline="middle"; c.fillText(txt,x,y); }
function box(c,x,y,w,h,col){ c.fillStyle=col; c.fillRect(x,y,w,h); }
function arrow(c,x1,y1,x2,y2,col){ c.strokeStyle=col; c.fillStyle=col; c.lineWidth=2;
  c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
  const a=Math.atan2(y2-y1,x2-x1); c.beginPath(); c.moveTo(x2,y2);
  c.lineTo(x2-8*Math.cos(a-0.45),y2-8*Math.sin(a-0.45)); c.lineTo(x2-8*Math.cos(a+0.45),y2-8*Math.sin(a+0.45)); c.fill(); }
function circ(c,x,y,r,col,ring){ c.beginPath(); c.arc(x,y,Math.max(0,r),0,TAU); if(ring){c.strokeStyle=col;c.lineWidth=1.5;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);} else {c.fillStyle=col;c.fill();} }
function figure(c,x,y,col,state,t,flip){ c.save(); c.translate(x,y); if(flip) c.scale(-1,1);
  c.strokeStyle=col; c.lineWidth=3; c.lineCap="round"; const J=state==="jump", sw=state==="run"?Math.sin(t*14)*9:0;
  circ(c,0,-34,7,col); c.beginPath(); c.moveTo(0,-27); c.lineTo(0,-8);
  if(state==="attack"){ c.moveTo(0,-22); c.lineTo(16,-22); } else { c.moveTo(0,-22); c.lineTo(9,J?-32:-14+sw*0.3); }
  c.moveTo(0,-22); c.lineTo(-8,J?-32:-14-sw*0.3); c.moveTo(0,-8); c.lineTo(sw,J?-2:4); c.moveTo(0,-8); c.lineTo(-sw,J?-2:4); c.stroke();
  if(state==="attack"){ c.strokeStyle=col; c.lineWidth=2; c.beginPath(); c.arc(14,-22,14,-1.1,1.1); c.stroke(); }
  c.restore(); }
const step = (st,t) => { const d=Math.min(0.05, t-(st.last??t)); st.last=t; return d; };
const key = (st,...ks) => ks.some(k=>st.keys.has(k));
const manual = (st,t) => st.man!==undefined && t-st.man < 4;
const clicked = st => { const n=st.clicks; st.clicks=0; return n; };
const auto = (st,t,every) => { if(st.clickT!==undefined && t-st.clickT<4) return false; if((st.autoT??-1e9)+every<=t){ st.autoT=t; return true; } return false; };

let audioCtx=null;
function beep(pitch,db){ try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  const o=audioCtx.createOscillator(), g=audioCtx.createGain(), n=audioCtx.currentTime;
  o.type="square"; o.frequency.setValueAtTime(520*pitch,n); o.frequency.exponentialRampToValueAtTime(260*pitch,n+0.12);
  g.gain.setValueAtTime(0.15*Math.pow(10,db/20),n); g.gain.exponentialRampToValueAtTime(0.0001,n+0.15);
  o.connect(g).connect(audioCtx.destination); o.start(n); o.stop(n+0.16); }catch(e){} }

const DEMOS = {
"Platformer player":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), g=h-22, s=st.s||(st.s={x:w/2,y:g,vx:0,vy:0,dir:1,jt:0.6,held:false});
  let dir, jp=false, jr=false;
  if(manual(st,t)){ dir=(key(st,"ArrowRight","d")?1:0)-(key(st,"ArrowLeft","a")?1:0); const hold=key(st," ","ArrowUp","w"); jp=hold&&!s.held; jr=!hold&&s.held; s.held=hold; }
  else { if(s.x>w-30)s.dir=-1; if(s.x<30)s.dir=1; dir=s.dir; s.jt-=dt; if(s.jt<=0&&s.y>=g){ jp=true; s.jt=1.3; } }
  const floor=s.y>=g; if(!floor) s.vy+=980*dt; if(jp&&floor) s.vy=p.jump_velocity; if(jr&&s.vy<0) s.vy*=p.cut_jump_factor;
  s.vx = dir ? dir*p.speed : 0; s.x=clamp(s.x+s.vx*dt,10,w-10); s.y+=s.vy*dt; if(s.y>=g){ s.y=g; s.vy=0; }
  ground(c,0,w,g); const dy=Math.max(s.y,12); spr(c,s.y<g?"p1":(s.vx?walk(t):"p0"),s.x,dy,s.vx<0);
  if(s.y<12) lbl(c,"↑ above screen",s.x,26,K.k,"center");
  if(Math.abs(s.vy)>20) arrow(c,s.x+18,dy-10,s.x+18,dy-10+clamp(s.vy/12,-35,35),s.vy<0?K.k:K.n);
  lbl(c,`velocity.y ${Math.round(s.vy)}`,10,14,K.muted); lbl(c,`peak ${Math.round(p.jump_velocity**2/1960)} px`,w-10,14,K.muted,"right"); },

"Coyote time and jump buffer":(c,w,h,t,K,st,p)=>{ const g=h-40, edge=w*0.5, sp=140, cyc=2.6, k=Math.floor(t/cyc), s=t%cyc;
  const d=[0.05,0.10,0.15][k%3], te=(edge-20)/sp, ok=d<=p.coyote_time;
  ground(c,0,edge,g); ground(c,Math.ceil(w*0.82/24)*24,w+24,g); spr(c,"spikes",edge+36,h+4);
  let x=20+sp*s, y=g;
  if(s>te){ if(ok && s>te+d){ const a=s-te-d, fy=0.5*980*d*d; y=g+fy-330*a+490*a*a; } else { const a=s-te; y=g+490*a*a; } }
  if(ok && y>g && x>w*0.82 && s>te+d+0.2) y=g;
  spr(c,y>g?"p1":walk(t),x,Math.min(y,h+30));
  if(s>te) { const left=Math.max(0,p.coyote_time-(s-te)); box(c,10,h-14,100,5,K.line); box(c,10,h-14,100*left/Math.max(p.coyote_time,0.001),5,K.f); lbl(c,"coyote_left",116,h-11,K.muted); }
  if(s>te+d) lbl(c,ok?`pressed ${d.toFixed(2)}s late → JUMP ✓`:`pressed ${d.toFixed(2)}s late → FELL ✗`,10,14,ok?K.f:K.k);
  else lbl(c,`jump press planned ${d.toFixed(2)}s after ledge`,10,14,K.muted); },

"Top-down 8-way movement":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), s=st.s||(st.s={x:w/2,y:h/2,vx:0,vy:0}); let ix=0,iy=0;
  if(manual(st,t)){ ix=(key(st,"ArrowRight","d")?1:0)-(key(st,"ArrowLeft","a")?1:0); iy=(key(st,"ArrowDown","s")?1:0)-(key(st,"ArrowUp","w")?1:0); }
  else { const seg=Math.floor(t/1.1); if(seg%3!==2){ const a=rnd(seg)*TAU; ix=Math.cos(a); iy=Math.sin(a); if(s.x<40)ix=1; if(s.x>w-40)ix=-1; if(s.y<40)iy=1; if(s.y>h-40)iy=-1; } }
  const m=Math.hypot(ix,iy); if(m>1){ix/=m;iy/=m;}
  const tx=(m?ix*p.max_speed:0), ty=(m?iy*p.max_speed:0), rate=(m?p.acceleration:p.friction)*dt;
  const dx=tx-s.vx, dy=ty-s.vy, dl=Math.hypot(dx,dy); if(dl<=rate){ s.vx=tx; s.vy=ty; } else { s.vx+=dx/dl*rate; s.vy+=dy/dl*rate; }
  s.x=clamp(s.x+s.vx*dt,10,w-10); s.y=clamp(s.y+s.vy*dt,10,h-10);
  c.fillStyle=K.line; for(let x=12;x<w;x+=24)for(let y=12;y<h;y+=24)c.fillRect(x,y,2,2);
  spr(c,(Math.hypot(s.vx,s.vy)>5)?pink(t):"q0",s.x,s.y+12,s.vx<0); const sp=Math.hypot(s.vx,s.vy); if(sp>5) arrow(c,s.x,s.y,s.x+s.vx/sp*(10+sp/8),s.y+s.vy/sp*(10+sp/8),K.n);
  lbl(c,`|velocity| ${Math.round(sp)}`,10,14,K.n); lbl(c,m?"accelerating":"friction",w-10,14,K.muted,"right"); },

"Dash with cooldown":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), g=h/2+20, s=st.s||(st.s={x:40,dir:1,dash:0,cd:0,trail:[]}); let dir, want=false;
  if(manual(st,t)){ dir=(key(st,"ArrowRight","d")?1:0)-(key(st,"ArrowLeft","a")?1:0); const hold=key(st,"Shift"," "); want=hold&&!s.held; s.held=hold; if(dir) s.dir=dir; }
  else { if(s.x>w-40)s.dir=-1; if(s.x<40)s.dir=1; dir=s.dir; s.at=(s.at??0)-dt; if(s.at<=0){ want=true; s.at=1.4; } }
  if(want&&s.cd<=0&&s.dash<=0&&(dir||s.dir)){ s.dash=p.dash_time; s.cd=p.dash_time+p.dash_cooldown; s.dd=dir||s.dir; }
  s.dash-=dt; s.cd-=dt; const v=s.dash>0? s.dd*p.dash_speed : dir*p.speed;
  s.x=clamp(s.x+v*dt*0.5,12,w-12); s.trail.unshift(s.x); s.trail.length=6;
  ground(c,0,w,g);
  if(s.dash>0) s.trail.forEach((x,i)=>{ c.globalAlpha=0.45-i*0.07; spr(c,"p1",x,g,s.dd<0); }); c.globalAlpha=1;
  spr(c,s.dash>0?"p1":walk(t),s.x,g,(s.dash>0?s.dd:s.dir)<0);
  const ready=s.cd<=0, f=ready?1:1-s.cd/(p.dash_time+p.dash_cooldown);
  box(c,10,h-18,100,6,K.line); box(c,10,h-18,100*f,6,ready?K.f:K.k); lbl(c,ready?"can_dash = true":"cooldown…",116,h-15,ready?K.f:K.muted);
  lbl(c,s.dash>0?"is_dashing = true":"walking",10,14,s.dash>0?K.s:K.muted); },

"State machine":(c,w,h,t,K,st)=>{ const dt=step(st,t), s=st.s||(st.s={state:"IDLE",timer:0,x:w*0.3,dir:1,y:0,vy:0,hist:[]});
  const go=n=>{ if(s.state!==n){ s.state=n; s.timer=0; } };
  s.timer+=dt; if(clicked(st)&&s.state!=="ATTACK") go("ATTACK");
  if(s.state==="IDLE"&&s.timer>0.9) go("RUN");
  else if(s.state==="RUN"){ s.x+=s.dir*90*dt; if(s.x>w*0.7)s.dir=-1; if(s.x<w*0.3)s.dir=1; if(s.timer>1.4){ s.vy=-260; go("JUMP"); } }
  else if(s.state==="JUMP"){ s.vy+=700*dt; s.y=Math.min(0,s.y+s.vy*dt); if(s.y>=0&&s.vy>0){ s.y=0; go("IDLE"); } }
  else if(s.state==="ATTACK"&&s.timer>0.3) go("IDLE");
  if(s.state!=="JUMP") s.y=0;
  const names=["IDLE","RUN","JUMP","ATTACK"], bw=(w-50)/4;
  names.forEach((n,i)=>{ const x=10+i*(bw+10), on=s.state===n; box(c,x,10,bw,24,on?K.acc:K.line); lbl(c,n,x+bw/2,22,on?K.panel:K.muted,"center"); });
  const g=h-14; ground(c,0,w,g);
  spr(c,s.state==="RUN"?walk(t):s.state==="JUMP"?"p1":"p0",s.x,g+s.y,s.dir<0,1.3); if(s.state==="ATTACK"){ c.strokeStyle="#fff"; c.lineWidth=3; c.beginPath(); c.arc(s.x+(s.dir<0?-14:14),g-16,16,s.dir<0?Math.PI-1.1:-1.1,s.dir<0?Math.PI+1.1:1.1); c.stroke(); } },

"Health with custom signals":(c,w,h,t,K,st,p)=>{ const s=st.s||(st.s={hp:p.max_health,last:-9,dead:-9}); const mx=p.max_health;
  const hit=()=>{ if(s.hp>0){ s.hp=clamp(s.hp-25,0,mx); s.last=t; if(s.hp===0) s.dead=t; } };
  for(let n=clicked(st);n>0;n--) hit(); if(auto(st,t,1.1)) hit();
  if(s.hp===0&&t-s.dead>1.2){ s.hp=mx; s.last=t; } s.hp=Math.min(s.hp,mx);
  const bw=w-40, by=h/2-8, f=s.hp/mx; box(c,20,by,bw,16,K.line); box(c,20,by,bw*f,16,f>0.5?K.f:f>0?K.s:K.k);
  lbl(c,`current: ${s.hp} / ${mx}`,20,by-16,K.ink); for(let i=0;i<4;i++){ const q=s.hp/mx*4-i; spr(c,q>=1?"heart":q>=0.5?"hhalf":"hempty",w-24-(3-i)*26,by-6); }
  if(t-s.last<0.5) lbl(c,"health_changed.emit()",20,by+34,K.n);
  if(s.hp===0){ c.globalAlpha=0.5+0.5*Math.sin(t*12); lbl(c,"died.emit()",w-20,by+34,K.k,"right"); c.globalAlpha=1; } },

"Hit, knockback and invincibility frames":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), g=h-24, home=w*0.45, s=st.s||(st.s={x:home,vx:0,inv:0,hp:100,ignored:-9,hitT:-9});
  const ex=w*0.82+Math.sin(t*2.2)*w*0.12; let hit=clicked(st)>0;
  if(!hit && ex-14<s.x+10) hit=true;
  if(hit){ if(s.inv>0){ s.ignored=t; } else { s.hp=s.hp<=10?100:s.hp-10; s.vx=-p.knockback; s.inv=p.invuln_time; s.hitT=t; } }
  s.inv-=dt; s.x+=s.vx*dt*0.5; s.vx*=Math.pow(0.02,dt); s.x+= (home-s.x)*dt*1.5; s.x=clamp(s.x,12,w-12);
  ground(c,0,w,g); spr(c,spiky(t),ex,g,true);
  if(!(s.inv>0 && Math.floor(t*20)%2)) spr(c,"p0",s.x,g);
  lbl(c,`hp ${s.hp}`,10,14,K.ink); lbl(c,s.inv>0?`invulnerable ${s.inv.toFixed(2)}s`:"vulnerable",w-10,14,s.inv>0?K.s:K.muted,"right");
  if(t-s.ignored<0.5) lbl(c,"hit ignored",s.x,g-44,K.muted,"center"); else if(t-s.hitT<0.4) lbl(c,"-10",s.x,g-44,K.k,"center"); },

"Bullet with lifetime":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), gy=h/2, s=st.s||(st.s={b:[],cd:0}); s.cd-=dt;
  if(s.cd<=0){ s.b.push({x:52,age:0}); s.cd=0.35; }
  const sc=0.4; s.b.forEach(b=>{ b.age+=dt; b.x+=p.speed*sc*dt; }); s.b=s.b.filter(b=>b.age<p.lifetime&&b.x<w+20);
  box(c,10,gy-12,34,24,K.muted); box(c,44,gy-4,10,8,K.muted);
  s.b.forEach(b=>{ c.globalAlpha=clamp((p.lifetime-b.age)/0.25,0,1); box(c,b.x,gy-3,12,6,K.s); }); c.globalAlpha=1;
  const range=52+p.speed*sc*p.lifetime; if(range<w){ c.strokeStyle=K.k; c.setLineDash([3,3]); c.beginPath(); c.moveTo(range,gy-24); c.lineTo(range,gy+24); c.stroke(); c.setLineDash([]); lbl(c,"queue_free()",range,gy+34,K.k,"center"); }
  lbl(c,`range = ${Math.round(p.speed*p.lifetime)} px`,10,14,K.muted); lbl(c,`${s.b.length} alive`,w-10,14,K.muted,"right"); },

"Connect signals in code":(c,w,h,t,K,st)=>{ const s=st.s||(st.s={t0:0}); if(clicked(st)||auto(st,t,1.6)) s.t0=t;
  const ex=50,ey=h/2, rs=[[w-60,h*0.25,"_on_health_changed"],[w-60,h*0.75,"_on_player_died"]], p=(t-s.t0)/0.9;
  c.strokeStyle=K.line; c.lineWidth=2; rs.forEach(([x,y])=>{c.beginPath();c.moveTo(ex+30,ey);c.lineTo(x-34,y);c.stroke();});
  box(c,ex-30,ey-16,60,32,K.acc); lbl(c,"Health",ex,ey,K.panel,"center");
  rs.forEach(([x,y,n])=>{ const lit=p>=1&&p<1.6; box(c,x-34,y-14,68,28,lit?K.f:K.line); lbl(c,lit?"runs!":"func",x,y,lit?K.panel:K.muted,"center");
    lbl(c,n,x+34,y+24,K.muted,"right"); if(p<1){ circ(c,ex+30+(x-34-ex-30)*p, ey+(y-ey)*p,5,K.n);} });
  if(p<1) lbl(c,"emit()",ex-30,ey-28,K.n); },

"Pickup / trigger zone":(c,w,h,t,K,st,p)=>{ const g=h-30, s=t%3, cx=w*0.62, px=20+Math.min(s/1.4,1)*(cx-34);
  ground(c,0,w,g); spr(c,s<1.4?walk(t):"p0",px,g);
  if(s<1.4){ spr(c,coin(t),cx,g-2); circ(c,cx,g-14,24,K.muted,true); lbl(c,"Area2D",cx,g-48,K.muted,"center"); }
  else { c.globalAlpha=clamp(1-(s-1.4)/1.2,0,1); lbl(c,`+${p.value}`,cx,g-40-(s-1.4)*30,K.s,"center"); c.globalAlpha=1; lbl(c,"body_entered → queue_free()",10,14,K.f); }
  lbl(c,`coins: ${s<1.4?0:p.value}`,w-10,14,K.ink,"right"); },

"Line-of-sight raycast":(c,w,h,t,K,st)=>{ const ey=h/2, ex=30, tx=w-30, wy=st.mouse?st.mouse.y:h/2+Math.sin(t*1.3)*h*0.55, blocked=Math.abs(wy-ey)<26;
  box(c,w/2-8,wy-26,16,52,K.muted); circ(c,ex,ey,10,K.acc); circ(c,tx,ey,10,K.s);
  c.strokeStyle=blocked?K.k:K.f; c.lineWidth=2; c.setLineDash([6,4]); c.beginPath(); c.moveTo(ex+10,ey); c.lineTo(blocked?w/2-8:tx-10,ey); c.stroke(); c.setLineDash([]);
  lbl(c,`can_see_target() → ${!blocked}`,10,14,blocked?K.k:K.f); },

"Enemy that chases the player":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), s=st.s||(st.s={x:w/2,y:h/2}), sc=0.35;
  const px=st.mouse?st.mouse.x:w/2+Math.cos(t*0.7)*w*(0.15+0.25*(0.5+0.5*Math.sin(t*0.4))), py=st.mouse?st.mouse.y:h/2+Math.sin(t*0.7)*h*0.32;
  const dx=px-s.x, dy=py-s.y, d=Math.hypot(dx,dy), R=p.detect_radius*sc, chasing=d<R&&d>p.stop_distance;
  if(chasing){ s.x+=dx/d*p.speed*0.6*dt; s.y+=dy/d*p.speed*0.6*dt; }
  circ(c,s.x,s.y,R,chasing?K.k:K.muted,true); spr(c,"p0",px,py+12); spr(c,bat(t),s.x,s.y+12,px<s.x);
  lbl(c,chasing?"chasing":(d<=p.stop_distance?"reached stop_distance":"idle (outside detect_radius)"),10,14,chasing?K.k:K.muted); },

"Patrol between points":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), pts=[[w*0.15,h*0.3],[w*0.85,h*0.3],[w*0.75,h*0.8],[w*0.25,h*0.8]], s=st.s||(st.s={x:pts[0][0],y:pts[0][1],i:1,wait:0});
  if(s.wait>0) s.wait-=dt; else { const [tx,ty]=pts[s.i], dx=tx-s.x, dy=ty-s.y, d=Math.hypot(dx,dy);
    if(d<4){ s.wait=p.wait_time; s.i=(s.i+1)%pts.length; } else { const v=Math.min(d,p.speed*0.8*dt); s.x+=dx/d*v; s.y+=dy/d*v; } }
  c.strokeStyle=K.line; c.setLineDash([4,4]); c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.stroke(); c.setLineDash([]);
  pts.forEach(([x,y],i)=>{ circ(c,x,y,5,i===s.i?K.n:K.muted); lbl(c,`points[${i}]`,x,y+(y<h/2?-12:14),K.muted,"center"); });
  spr(c,s.wait>0?"e0":spiky(t),s.x,s.y+12,pts[s.i][0]<s.x); lbl(c,s.wait>0?`waiting ${s.wait.toFixed(1)}s`:`→ index ${s.i}`,10,14,s.wait>0?K.s:K.muted); },

"Wait, repeat and cooldowns":(c,w,h,t,K,st,p)=>{ const s=st.s||(st.s={last:-9,log:[]}), bw=w-130, x0=110;
  const shoot=()=>{ const ok=t-s.last>=p.fire_rate; if(ok)s.last=t; s.log.unshift({ok,t}); s.log.length=Math.min(s.log.length,14); };
  for(let n=clicked(st);n>0;n--) shoot(); if(auto(st,t,0.12)) shoot();
  const a=t%3, f=clamp(a/2,0,1); lbl(c,"await 2.0s",10,24,K.muted); box(c,x0,19,bw,10,K.line); box(c,x0,19,bw*f,10,f>=1?K.f:K.n); if(f>=1) lbl(c,"timeout!",x0+bw,40,K.f,"right");
  lbl(c,"Timer 3.0s",10,h/2-8,K.muted); const r=(t%3)/3; box(c,x0,h/2-13,bw,10,K.line); box(c,x0,h/2-13,bw*r,10,K.acc); if(r<0.12) lbl(c,"spawn wave",x0+bw,h/2+8,K.s,"right");
  lbl(c,"try_shoot()",10,h-36,K.muted); const cf=clamp((t-s.last)/p.fire_rate,0,1); box(c,x0,h-41,bw,10,K.line); box(c,x0,h-41,bw*cf,10,cf>=1?K.f:K.k);
  s.log.forEach((e,i)=>{ const x=x0+i*14, y=h-16; if(e.ok) circ(c,x+5,y,5,K.f); else lbl(c,"✕",x+5,y,K.k,"center"); }); },

"Spawn a scene (bullets, enemies)":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), gy=h/2, s=st.s||(st.s={b:[],flash:-9});
  const fire=()=>{ s.b.push({x:64}); s.flash=t; }; for(let n=clicked(st);n>0;n--) fire(); if(auto(st,t,0.35)) fire();
  s.b.forEach(b=>b.x+=p.bullet_speed*0.5*dt); s.b=s.b.filter(b=>b.x<w+20);
  box(c,14,gy-12,34,24,K.muted); box(c,48,gy-4,14,8,K.muted); s.b.forEach(b=>box(c,b.x,gy-3,12,6,K.s));
  if(t-s.flash<0.08) circ(c,64,gy,8,K.s);
  lbl(c,"BULLET.instantiate()",10,14,K.f); lbl(c,`${s.b.length} nodes in scene`,w-10,14,K.muted,"right"); lbl(c,'preload("bullet.tscn")',10,h-12,K.muted); },

"Change scene with fade":(c,w,h,t,K,st)=>{ const s=st.s||(st.s={scene:1,t0:-9}); if((clicked(st)||auto(st,t,2.6))&&t-s.t0>1) s.t0=t;
  const e=t-s.t0; let a=0; if(e<0.4)a=e/0.4; else if(e<0.8){ a=1-(e-0.4)/0.4; if(!s.sw){ s.scene=s.scene===1?2:1; s.sw=1; } } else s.sw=0;
  box(c,0,0,w,h,s.scene===1?K.n:K.f); lbl(c,`level_${s.scene}.tscn`,w/2,h/2,K.panel,"center");
  c.globalAlpha=a; box(c,0,0,w,h,"#000"); c.globalAlpha=1; lbl(c,`modulate:a = ${a.toFixed(2)}`,10,14,a>0.5?"#fff":K.panel); },

"Checkpoint and respawn":(c,w,h,t,K,st)=>{ const g=h-30, cyc=5, s=t%cyc, flagX=w*0.35, pitX=w*0.7;
  ground(c,0,Math.floor(pitX/24)*24+24,g); ground(c,Math.floor(pitX/24)*24+72,w+24,g);
  let x, y=g, phase; if(s<1.2){ x=20+(flagX-20)*(s/1.2); phase="run"; } else if(s<2.4){ x=flagX+(pitX+10-flagX)*((s-1.2)/1.2); phase="run"; }
  else if(s<3.2){ x=pitX+10; y=g+((s-2.4)/0.8)**2*80; phase="fall"; } else { x=flagX; phase="respawn"; }
  const touched = s>=1.2;
  spr(c,touched?flag(t):"pole",flagX,g);
  if(phase!=="fall"||y<h+24) spr(c,phase==="fall"?"p1":walk(t),x,y);
  lbl(c,phase==="respawn"?"die() → global_position = respawn_point":touched?"respawn_point saved":"respawn_point = level start",10,14,phase==="respawn"?K.f:K.muted); },

"Interact prompt (press E)":(c,w,h,t,K,st)=>{ const dt=step(st,t), g=h-24, cx=w*0.65, s=st.s||(st.s={x:30,dir:1,open:0});
  if(manual(st,t)){ const d=(key(st,"ArrowRight","d")?1:0)-(key(st,"ArrowLeft","a")?1:0); s.x=clamp(s.x+d*120*dt,12,w-12); }
  else { s.x+=s.dir*70*dt; if(s.x>w-20)s.dir=-1; if(s.x<20)s.dir=1; }
  const inside=Math.abs(s.x-cx)<40, ePress=key(st,"e","E")&&!s.held; s.held=key(st,"e","E");
  if(inside&&(ePress||clicked(st)||(!manual(st,t)&&Math.abs(s.x-cx)<3&&s.open<=0))) s.open=1.5; s.open-=dt;
  ground(c,0,w,g); c.fillStyle=K.line; c.globalAlpha=0.35; c.fillRect(cx-40,g-50,80,50); c.globalAlpha=1;
  spr(c,s.open>0?"blkused":"blk",cx,g-4); if(s.open>0) spr(c,coin(t),cx,g-30-(1.5-s.open)*20);
  if(s.open>0) lbl(c,"interacted.emit() ✦",cx,g-58,K.f,"center"); else if(inside){ box(c,cx-34,g-70,68,20,K.panel); c.strokeStyle=K.line; c.strokeRect(cx-34,g-70,68,20); lbl(c,"[E] Open",cx,g-60,K.ink,"center"); }
  spr(c,walk(t),s.x,g,manual(st,t)?!key(st,"ArrowRight","d")&&s.lastL:s.dir<0); s.lastL=key(st,"ArrowLeft","a")||(s.lastL&&!key(st,"ArrowRight","d")); lbl(c,`player_inside = ${inside}`,10,14,inside?K.f:K.muted); },

"Dialogue typewriter":(c,w,h,t,K,st,p)=>{ const lines=["Stalker: Get out of here, stalker.","The Zone doesn't forgive mistakes.","Take this detector. You'll need it."];
  const s=st.s||(st.s={i:0,t0:t,full:false,done:0}); const n=clicked(st);
  const len=lines[s.i].length, shown=s.full?len:Math.min(len,Math.floor((t-s.t0)*p.chars_per_second)), running=shown<len;
  if(n||(!running&&auto(st,t,1.6))){ if(running) s.full=true; else { s.i=(s.i+1)%lines.length; s.t0=t; s.full=false; } }
  box(c,12,h-82,w-24,62,K.panel); c.strokeStyle=K.line; c.strokeRect(12,h-82,w-24,62);
  const txt=lines[s.i].slice(0,shown); c.font="500 13px 'IBM Plex Sans', system-ui, sans-serif"; c.fillStyle=K.ink; c.textAlign="left"; c.textBaseline="top";
  let line="", y=h-72; txt.split(" ").forEach(wd=>{ if(c.measureText(line+wd).width>w-48){ c.fillText(line,24,y); y+=18; line=""; } line+=wd+" "; }); c.fillText(line,24,y);
  if(!running && Math.floor(t*2)%2) lbl(c,"▼",w-26,h-30,K.f,"center");
  lbl(c,`visible_ratio ${(shown/len).toFixed(2)}`,10,14,K.muted); lbl(c,`line ${s.i+1}/${lines.length}`,w-10,14,K.muted,"right"); },

"Inventory with stacks":(c,w,h,t,K,st,p)=>{ const ids=[["coin",K.s],["heart",K.k],["gem",K.n],["key",K.muted],["mushroom",K.f]], s=st.s||(st.s={items:{},msg:"",mt:-9,slot:-1});
  const pick=()=>{ const id=ids[Math.floor(Math.random()*ids.length)][0], have=s.items[id]||0, add=Math.min(1,p.max_stack-have);
    if(add>0){ s.items[id]=have+add; s.msg=`add_item("${id}") → 1`; } else { s.msg=`"${id}" full → 0`; } s.mt=t; s.last=id; };
  for(let n=clicked(st);n>0;n--) pick(); if(auto(st,t,0.7)){ pick(); if(Object.values(s.items).every(v=>v>=p.max_stack)) s.items={}; }
  for(const k in s.items) s.items[k]=Math.min(s.items[k],p.max_stack);
  const sz=Math.min(46,(w-20-4*8)/5), x0=(w-(sz*5+32))/2, y0=h/2-sz/2+6;
  ids.forEach(([id,col],i)=>{ const x=x0+i*(sz+8), n=s.items[id]||0, hl=s.last===id&&t-s.mt<0.4;
    box(c,x,y0,sz,sz,hl?K.acc:K.line); box(c,x+2,y0+2,sz-4,sz-4,K.panel);
    if(n){ spr(c,id,x+sz/2,y0+sz/2+10); lbl(c,String(n),x+sz-5,y0+sz-9,n>=p.max_stack?K.k:K.ink,"right"); }
    lbl(c,id,x+sz/2,y0+sz+12,K.muted,"center"); });
  if(t-s.mt<1.2) lbl(c,s.msg,10,14,s.msg.includes("full")?K.k:K.f); },

"Weighted random loot drop":(c,w,h,t,K,st)=>{ const tbl=[["coin",60,K.s],["potion",25,K.k],["sword",12,K.n],["legendary",3,K.t]], tot=100, s=st.s||(st.s={cnt:[0,0,0,0],n:0,lastI:-1,lt:-9});
  const roll=()=>{ let r=1+Math.floor(Math.random()*tot); for(let i=0;i<tbl.length;i++){ r-=tbl[i][1]; if(r<=0){ s.cnt[i]++; s.n++; s.lastI=i; s.lt=t; return; } } };
  if(clicked(st)) for(let i=0;i<50;i++) roll(); if(auto(st,t,0.15)){ roll(); if(s.n>400){ s.cnt=[0,0,0,0]; s.n=0; } }
  const bw=w-150, y0=30;
  tbl.forEach(([id,wt,col],i)=>{ const y=y0+i*30, share=s.n?s.cnt[i]/s.n:0;
    const ic=["coin","heart",null,"gem"][i]; if(ic) spr(c,ic,20,y+18,false,0.75); lbl(c,id,36,y+7,i===s.lastI&&t-s.lt<0.3?col:K.ink); box(c,110,y,bw-20,14,"#ffffff55"); box(c,110,y,(bw-20)*share,14,col);
    box(c,110+(bw-20)*wt/tot-1,y-3,2,20,K.ink); lbl(c,`${(share*100).toFixed(0)}%`,w-10,y+7,K.muted,"right"); });
  lbl(c,`${s.n} rolls · line = expected weight`,10,h-12,K.muted); },

"Score manager (autoload)":(c,w,h,t,K,st,p)=>{ const s=st.s||(st.s={score:0,high:0,pop:-9,coins:[]});
  const add=()=>{ s.score+=p.coin_value; s.high=Math.max(s.high,s.score); s.pop=t; s.coins.push({t0:t,x:w*0.2+Math.random()*w*0.6}); };
  for(let n=clicked(st);n>0;n--) add(); if(auto(st,t,0.8)){ add(); if(s.score>=p.coin_value*12){ s.score=0; s.pop=t; } }
  s.coins=s.coins.filter(k=>t-k.t0<0.7);
  s.coins.forEach(k=>{ const a=(t-k.t0)/0.7; spr(c,coin(t),k.x+(w-80-k.x)*a,h-18-(h-60)*a); });
  const sc=1+Math.max(0,0.3-(t-s.pop))*1.2; c.save(); c.translate(w-14,26); c.scale(sc,sc); lbl(c,`Score: ${s.score}`,0,0,K.ink,"right"); c.restore();
  lbl(c,`High: ${s.high}`,w-14,48,K.muted,"right"); lbl(c,"score_changed.emit()",10,14,t-s.pop<0.4?K.n:K.muted); },

"Tweens: pop, flash, float":(c,w,h,t,K,st)=>{ const s=st.s||(st.s={t0:0}); if(clicked(st)||auto(st,t,2)) s.t0=t; const e=t-s.t0, cy=h/2-6, xs=[w*0.2,w*0.5,w*0.8];
  const p=clamp(e/0.3,0,1), c1=1.70158, sc=1+(c1+1)*Math.pow(p-1,3)+c1*Math.pow(p-1,2);
  c.save(); c.translate(xs[0],cy); c.scale(sc,sc); box(c,-16,-16,32,32,K.acc); c.restore();
  box(c,xs[1]-16,cy-16,32,32,e<0.05?"#e5484d":e<0.2?"#e5484d99":K.n);
  box(c,xs[2]-16,cy-16-8*(0.5-0.5*Math.cos(t*Math.PI/0.8)),32,32,K.t);
  ["pop","hit_flash","float_loop"].forEach((n,i)=>lbl(c,n,xs[i],h-16,K.muted,"center")); },

"Sprite animation by state":(c,w,h,t,K,st)=>{ const dt=step(st,t), g=h-16, s=st.s||(st.s={x:w/2,vx:0,y:0,vy:0,flip:false,held:false});
  let d=0, jp=false; if(manual(st,t)){ d=(key(st,"ArrowRight","d")?1:0)-(key(st,"ArrowLeft","a")?1:0); const hold=key(st," ","ArrowUp","w"); jp=hold&&!s.held; s.held=hold; }
  else { const ph=t%5; d=ph<1?0:ph<2.5?1:ph<4?-1:0; jp=ph>4&&ph<4.05; }
  s.vx=d*120; if(jp&&s.y===0) s.vy=-300; if(s.y<0||s.vy<0){ s.vy+=900*dt; s.y=Math.min(0,s.y+s.vy*dt); if(s.y===0) s.vy=0; }
  s.x=clamp(s.x+s.vx*dt,20,w-20); if(s.vx) s.flip=s.vx<0;
  const state=s.y<0?"jump":Math.abs(s.vx)>5?"run":"idle"; ground(c,0,w,g); spr(c,state==="run"?walk(t):state==="jump"?"p1":"p0",s.x,g+s.y,s.flip,1.4);
  lbl(c,`play("${state}")`,10,14,K.f); lbl(c,`flip_h = ${s.flip}`,w-10,14,K.muted,"right"); },

"Screen shake":(c,w,h,t,K,st,p)=>{ const dt=step(st,t), s=st.s||(st.s={tr:0,boom:-9}); for(let n=clicked(st);n>0;n--){ s.tr=Math.min(1,s.tr+0.4); s.boom=t; }
  if(auto(st,t,3)){ s.tr=1; s.boom=t; } s.tr=Math.max(0,s.tr-p.decay*dt); const pw=s.tr*s.tr, ox=16*pw*(Math.random()*2-1), oy=12*pw*(Math.random()*2-1);
  c.save(); c.translate(ox,oy); ground(c,-24,w+48,h-30); spr(c,"tree",w*0.12,h-30); spr(c,"p0",w*0.3,h-30,false,1.3); spr(c,"crate",w*0.6+13,h-30); spr(c,"crate",w*0.6+13,h-54);
  const e=t-s.boom; if(e<0.3) circ(c,w*0.6+13,h-50,26*(1-e/0.3),K.s); c.restore();
  box(c,10,10,90,6,K.line); box(c,10,10,90*s.tr,6,K.k); lbl(c,`trauma ${s.tr.toFixed(2)}`,108,13,K.muted); },

"Pause menu":(c,w,h,t,K,st)=>{ const dt=step(st,t), s=st.s||(st.s={paused:false,b:{x:40,y:40,vx:120,vy:90}});
  const esc=key(st,"Escape"); if((clicked(st)||(esc&&!s.held)||auto(st,t,2.2))) s.paused=!s.paused; s.held=esc;
  const b=s.b; if(!s.paused){ b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.x<10||b.x>w-10)b.vx*=-1; if(b.y<24||b.y>h-10)b.vy*=-1; b.x=clamp(b.x,10,w-10); b.y=clamp(b.y,24,h-10); }
  spr(c,s.paused?"b0":bat(t),b.x,b.y+12,b.vx<0);
  if(s.paused){ c.globalAlpha=0.55; box(c,0,0,w,h,K.bg); c.globalAlpha=1; const mw=140,mh=72; box(c,w/2-mw/2,h/2-mh/2,mw,mh,K.panel); c.strokeStyle=K.line; c.strokeRect(w/2-mw/2,h/2-mh/2,mw,mh);
    lbl(c,"PAUSED",w/2,h/2-16,K.ink,"center"); lbl(c,`Resume${Math.floor(t*3)%2?" ◂":"  "}  ·  Quit`,w/2,h/2+12,K.f,"center"); }
  lbl(c,`paused = ${s.paused}`,10,14,s.paused?K.k:K.muted); },

"Save and load to JSON":(c,w,h,t,K)=>{ const s=t%4, saving=s<2, p=(s%2)/2, dx=16, fx=w-70;
  box(c,dx,h/2-36,118,72,K.panel); c.strokeStyle=K.line; c.strokeRect(dx,h/2-36,118,72);
  lbl(c,'"coins": 42',dx+8,h/2-18,K.s); lbl(c,'"level": 3',dx+8,h/2,K.s); lbl(c,'"volume": 0.8',dx+8,h/2+18,K.s);
  c.fillStyle=K.n; c.beginPath(); c.moveTo(fx,h/2-30); c.lineTo(fx+34,h/2-30); c.lineTo(fx+46,h/2-18); c.lineTo(fx+46,h/2+30); c.lineTo(fx,h/2+30); c.closePath(); c.fill(); lbl(c,"JSON",fx+23,h/2+6,K.panel,"center");
  const x1=dx+128, x2=fx-10, q=clamp(p*1.4,0,1); if(saving) circ(c,x1+(x2-x1)*q,h/2,6,K.f); else circ(c,x2-(x2-x1)*q,h/2,6,K.t);
  lbl(c,saving?"save_game() →":"← load_game()",(x1+x2)/2,h/2-24,saving?K.f:K.t,"center"); lbl(c,"user://save.json",fx+23,h/2+44,K.muted,"center"); },

"Sound effects with pitch variation":(c,w,h,t,K,st,p)=>{ const s=st.s||(st.s={pitch:1,t0:-9});
  if(clicked(st)){ s.pitch=1+(Math.random()*2-1)*p.pitch_range; s.t0=t; beep(s.pitch,p.volume_db); }
  else if(auto(st,t,0.7)){ s.pitch=1+(Math.random()*2-1)*p.pitch_range; s.t0=t; }
  const env=Math.exp(-(t-s.t0)*4)*Math.pow(10,p.volume_db/40), n=Math.floor((w-20)/7);
  for(let i=0;i<n;i++){ const v=Math.abs(Math.sin(i*0.35*s.pitch*1.6+t*8*s.pitch))*env*(h*0.34)+2; box(c,10+i*7,h/2-v,4,v*2,K.acc); }
  lbl(c,`pitch_scale = ${s.pitch.toFixed(2)}`,10,14,K.n); lbl(c,`${p.volume_db} dB`,w-10,14,K.muted,"right"); },

"Mouse aim and click":(c,w,h,t,K,st)=>{ const dt=step(st,t), s=st.s||(st.s={shots:[]}), cx=w/2, cy=h/2;
  const mx=st.mouse?st.mouse.x:w/2+Math.sin(t*0.9)*w*0.38, my=st.mouse?st.mouse.y:h/2+Math.sin(t*1.7)*h*0.36, a=Math.atan2(my-cy,mx-cx);
  if(clicked(st)||auto(st,t,1)){ s.shots.push({a,d:24}); s.ft=t; }
  s.shots.forEach(sh=>sh.d+=260*dt); s.shots=s.shots.filter(sh=>sh.d<Math.max(w,h));
  s.shots.forEach(sh=>circ(c,cx+Math.cos(sh.a)*sh.d,cy+Math.sin(sh.a)*sh.d,4,K.s));
  c.save(); c.translate(cx,cy); c.rotate(a); box(c,0,-4,30,8,K.muted); c.restore(); circ(c,cx,cy,14,K.acc);
  if(!st.mouse){ c.fillStyle=K.ink; c.beginPath(); c.moveTo(mx,my); c.lineTo(mx,my+16); c.lineTo(mx+5,my+12); c.lineTo(mx+11,my+12); c.closePath(); c.fill(); }
  lbl(c,t-(s.ft??-9)<0.15?"fired.emit()":"look_at(mouse)",10,14,t-(s.ft??-9)<0.15?K.s:K.muted); }
};

Object.assign(DEMOS,{
"Settings menu: volume and fullscreen":(c,w,h,t,K,st)=>{ const s=st.s||(st.s={vol:0.7,full:false}); if(clicked(st)) s.full=!s.full; else if(auto(st,t,2.4)) s.full=!s.full;
  const bx=30,bw=w-140,by=70; if(st.mouse && st.mouse.y>40) s.vol=clamp((st.mouse.x-bx)/bw,0,1); else if(!st.mouse) s.vol=0.5+0.45*Math.sin(t*0.9);
  const ww=s.full?w-16:w*0.55, wh=s.full?h-16:h*0.5; c.globalAlpha=0.35; box(c,(w-ww)/2,(h-wh)/2,ww,wh,K.ink); c.globalAlpha=1;
  box(c,14,14,w-28,h-28,K.panel); c.strokeStyle=K.ink; c.lineWidth=2; c.strokeRect(14,14,w-28,h-28);
  lbl(c,"SETTINGS",26,32,K.ink); lbl(c,"Volume",bx,by-14,K.muted); box(c,bx,by-3,bw,6,"#c9c3d9"); box(c,bx,by-3,bw*s.vol,6,K.f); box(c,bx+bw*s.vol-6,by-9,12,18,K.ink);
  const db=s.vol<0.01?"-inf (muted)":(20*Math.log10(s.vol)).toFixed(1)+" dB"; lbl(c,db,bx+bw+12,by,K.ink);
  lbl(c,"Fullscreen",bx,h-48,K.muted); const tx=bx+100; box(c,tx,h-56,40,18,s.full?K.f:"#c9c3d9"); box(c,s.full?tx+22:tx+2,h-54,16,14,"#fff");
  lbl(c,s.full?"WINDOW_MODE_FULLSCREEN":"WINDOW_MODE_WINDOWED",tx+50,h-47,K.n);
  for(let i=0;i<Math.round(s.vol*8);i++) box(c,w-60+i*4,h-36-i*3,3,6+i*3,K.f); },
"Key rebinding":(c,w,h,t,K,st)=>{ const s=st.s||(st.s={b:{"ui_accept":"Space","dash":"Shift"},wait:null,flash:-9}); st.capture=!!s.wait;
  if(clicked(st)) s.wait=s.wait?null:"ui_accept"; else if(auto(st,t,3)) s.wait=s.wait?null:"ui_accept";
  if(st.anyKey){ if(s.wait){ const k=st.anyKey===" "?"Space":st.anyKey.length===1?st.anyKey.toUpperCase():st.anyKey; s.b[s.wait]=k; s.wait=null; s.flash=t; } st.anyKey=null; }
  else if(s.wait && !manual(st,t) && st.clickT===undefined && (t%3)>2.2){ s.b.ui_accept=s.b.ui_accept==="Space"?"W":"Space"; s.wait=null; s.flash=t; }
  [["ui_accept",40],["dash",96]].forEach(([a,y])=>{ const on=s.wait===a, fl=a==="ui_accept"&&t-s.flash<0.6; box(c,24,y-20,w-48,40,on?K.acc:fl?K.f:K.panel); c.strokeStyle=K.ink; c.lineWidth=2; c.strokeRect(24,y-20,w-48,40);
    lbl(c,on?"Press a key...":`${a}: ${s.b[a]}`,w/2,y,K.ink,"center"); });
  lbl(c,s.wait?"waiting = true":"InputMap.action_add_event()",10,h-12,s.wait?K.k:K.muted); },
"Day/night cycle":(c,w,h,t,K,st,p)=>{ const tod=((t/(p.day_length/10))+0.25)%1, hr=Math.floor(tod*24), mn=Math.floor((tod*24%1)*60);
  const stops=[[0,[16,22,60]],[0.25,[255,170,120]],[0.32,[255,255,255]],[0.68,[255,255,255]],[0.76,[255,140,80]],[0.85,[40,40,110]],[1,[16,22,60]]];
  let col=[255,255,255]; for(let i=0;i<stops.length-1;i++){ const [a,ca]=stops[i],[b,cb]=stops[i+1]; if(tod>=a&&tod<=b){ const f=(tod-a)/(b-a); col=ca.map((v,j)=>Math.round(v+(cb[j]-v)*f)); } }
  const ang=(tod-0.25)*TAU, sx=w/2-Math.cos(ang)*w*0.4, sy=h-30-Math.sin(ang)*(h-50), mx=w/2+Math.cos(ang)*w*0.4, my=h-30+Math.sin(ang)*(h-50);
  circ(c,sx,sy,12,"#ffd84a"); circ(c,mx,my,9,"#eef");
  ground(c,0,w,h-30); spr(c,"tree",w*0.2,h-30); spr(c,"p0",w*0.5,h-30); spr(c,"bush",w*0.75,h-30); spr(c,"sign",w*0.88,h-30);
  c.globalCompositeOperation="multiply"; c.fillStyle=`rgb(${col.join(",")})`; c.fillRect(0,0,w,h); c.globalCompositeOperation="source-over";
  const night=hr<6||hr>=20; if(night){ circ(c,w*0.88,h-48,14,"#ffd84a55"); }
  box(c,8,6,150,18,"#000000aa"); lbl(c,`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}  ${night?"is_night()":"day"}`,14,15,"#fff"); },
"Minimap":(c,w,h,t,K,st,p)=>{ const mw=Math.min(150,w*0.4), mh=h-24, mx0=w-mw-12, my0=12, vw=mx0-24;
  const W=1600, H=600, rng=s=>rnd(s);
  const px=st.mouse&&st.mouse.x<vw?clamp(st.mouse.x/vw,0,1)*W:W/2+Math.sin(t*0.5)*W*0.42, py=H/2+Math.sin(t*0.9)*H*0.25;
  const plats=[]; for(let i=0;i<30;i++) plats.push([rng(i)*W,rng(i+50)*H,60+rng(i+90)*120]);
  const coins=[]; for(let i=0;i<18;i++) coins.push([rng(i+200)*W,rng(i+300)*H]);
  const view=(x0,y0,vwid,vh,scale,mini)=>{ c.save(); c.beginPath(); c.rect(x0,y0,vwid,vh); c.clip(); box(c,x0,y0,vwid,vh,mini?"#2b5f80":"#5fcde4");
    const ox=x0+vwid/2-px*scale, oy=y0+vh/2-py*scale;
    plats.forEach(([x,y,l])=>box(c,ox+x*scale,oy+y*scale,l*scale,Math.max(2,12*scale),mini?"#9ee6ff":"#3e8f4f"));
    coins.forEach(([x,y])=> mini? box(c,ox+x*scale-1,oy+y*scale-1,3,3,"#ffcc4d") : spr(c,coin(t),ox+x*scale,oy+y*scale+12));
    if(mini){ circ(c,x0+vwid/2,y0+vh/2,4,"#ff5a6b"); c.strokeStyle="#fff"; c.lineWidth=1; const vs=vwid*p.zoom_out/p.zoom_out; c.strokeRect(x0+vwid/2-(vw/2)*scale/1,y0+vh/2-(h/2)*scale,vw*scale,h*scale); }
    else spr(c,walk(t),x0+vwid/2,y0+vh/2+12);
    c.restore(); };
  view(0,0,vw+12,h,1,false);
  const ms=1/p.zoom_out; view(mx0,my0,mw,mh,ms,true); c.strokeStyle="#000"; c.lineWidth=3; c.strokeRect(mx0,my0,mw,mh);
  lbl(c,`zoom = 1/${p.zoom_out}`,mx0+4,my0+mh+8,K.ink); }
});
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const visible = new Set(), states = new WeakMap();
const stOf = cv => { if(!states.has(cv)) states.set(cv,{keys:new Set(),clicks:0}); return states.get(cv); };
const io = "IntersectionObserver" in window ? new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target))) : null;
const now = () => performance.now()/1000;
function draw(cv,t,K){ K=K||C(); const dpr=Math.min(2,devicePixelRatio||1), w=cv.clientWidth, h=cv.clientHeight; if(!w) return;
  if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
  const c=cv.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,w,h); c.fillStyle="#5fcde4"; c.fillRect(0,0,w,h);
  const i=+cv.dataset.d; try{ DEMOS[R[i].title](c,w,h,t,K,stOf(cv),P(i)); }catch(e){ console.error(e); } }
function wire(cv){ const st=stOf(cv);
  const pos=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  cv.addEventListener("pointermove",e=>{ st.mouse=pos(e); });
  cv.addEventListener("pointerleave",()=>{ st.mouse=null; });
  cv.addEventListener("pointerdown",e=>{ st.clicks++; st.clickT=now(); if(e.pointerType!=="mouse") st.mouse=pos(e); cv.focus({preventScroll:true}); });
  cv.addEventListener("keydown",e=>{ st.anyKey=e.key; if(st.capture){ e.preventDefault(); return; } if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," ","Shift","Escape","e","E","a","d","w","s"].includes(e.key)){ e.preventDefault(); st.keys.add(e.key); st.man=now(); } });
  cv.addEventListener("keyup",e=>{ st.keys.delete(e.key); st.man=now(); });
  cv.addEventListener("blur",()=>st.keys.clear()); }
function observeCanvases(){ visible.clear(); document.querySelectorAll("canvas[data-d]").forEach(cv=>{ wire(cv); if(io) io.observe(cv); else visible.add(cv); draw(cv, reduce?1.2:now()); }); }
function loop(ts){ if(visible.size){ const K=C(), t=ts/1000; visible.forEach(cv=>{ if(!reduce || stOf(cv).clicks || stOf(cv).keys.size) draw(cv,t,K); }); } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
addEventListener("resize",()=>document.querySelectorAll("canvas[data-d]").forEach(cv=>draw(cv,now())));

/* ---------- Banner + logo ---------- */
{ const n=document.getElementById("nrec"); if(n) n.textContent = R.length; }
function drawLogo(){ const lg=document.getElementById("logo"); if(!lg) return; const c=lg.getContext("2d"); c.clearRect(0,0,24,24); spr(c,"p0",12,24); }
const bannerCv=document.getElementById("banner");
function drawBanner(t){ if(!bannerCv) return; const dpr=Math.min(2,devicePixelRatio||1), w=bannerCv.clientWidth, h=bannerCv.clientHeight; if(!w) return;
  if(bannerCv.width!==Math.round(w*dpr)){ bannerCv.width=Math.round(w*dpr); bannerCv.height=Math.round(h*dpr); }
  const c=bannerCv.getContext("2d"), S=2; c.setTransform(dpr,0,0,dpr,0,0); c.imageSmoothingEnabled=false;
  c.fillStyle="#5fcde4"; c.fillRect(0,0,w,h);
  c.fillStyle="#ffffffcc"; for(let i=0;i<6;i++){ const x=((i*230-t*14)%(w+240)+w+240)%(w+240)-120, y=24+(i%3)*26; c.fillRect(x,y,70,14); c.fillRect(x+14,y-10,40,10); }
  c.fillStyle="#7fd8ea"; for(let i=0;i<8;i++){ const x=((i*180-t*28)%(w+200)+w+200)%(w+200)-100; c.beginPath(); c.moveTo(x,h-48*S+10); c.lineTo(x+90,h-48*S-50); c.lineTo(x+180,h-48*S+10); c.fill(); }
  const scroll=t*90, g=h-24*S, T=24*S;
  for(let x=-(scroll%T)-T; x<w+T; x+=T){ spr(c,"g2",x+T/2,g+T,false,S); spr(c,"dirt",x+T/2,g+2*T,false,S); }
  const prop=(k,name,sp)=>{ const x=((k*157-scroll*sp)%(w+300)+w+300)%(w+300)-60; spr(c,name,x,g,false,S); };
  prop(1,"tree",1); prop(3,"bush",1); prop(5,"tree",1); prop(7,"sign",1); prop(9,"cactus",1); prop(11,"mushroom",1);
  const px=Math.min(w*0.28,220), cyc=1.8, ph=(t%cyc)/cyc, jumping=ph>0.55&&ph<0.95, jy=jumping?Math.sin((ph-0.55)/0.4*Math.PI)*70:0;
  const ex=px+(0.75-ph)*cyc*120; spr(c,spiky(t),ex,g,true,S);
  for(let i=0;i<5;i++){ const cx=((i*70+w-scroll*1.0)%(w+80)+w+80)%(w+80)-40; if(Math.abs(cx-px)>16) spr(c,coin(t+i*0.1),cx,g-90-(i%2)*14,false,S); }
  spr(c,jumping?"p1":walk(t),px,g-jy,false,S);
  spr(c,bat(t),w*0.72+Math.sin(t*1.3)*60,70+Math.sin(t*2.1)*14,Math.cos(t*1.3)<0,S);
  c.fillStyle="#00000055"; c.fillRect(0,h-6,w,6); }
function bannerLoop(ts){ if(!reduce) drawBanner(ts/1000); requestAnimationFrame(bannerLoop); }
ATLAS.onload=()=>{ drawLogo(); drawBanner(reduce?2:now()); document.querySelectorAll("canvas[data-d]").forEach(cv=>draw(cv,reduce?1.2:now())); };
if(ATLAS.complete) ATLAS.onload();
requestAnimationFrame(bannerLoop);
addEventListener("resize",()=>drawBanner(now()));

/* ---------- Code highlighting + page ---------- */
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const KW = "extends|class_name|func|var|const|signal|enum|if|elif|else|for|while|in|return|and|or|not|await|true|false|null|self|is|set|get|match|pass|break|continue";
function hl(src, changed){
  const re = new RegExp(`(#[^\\n]*)|("(?:[^"\\\\]|\\\\.)*")|(@\\w+)|\\b(${KW})\\b|\\b(\\d+\\.?\\d*)\\b|\\b([A-Z][A-Za-z0-9_]*)\\b|\\b([a-z_]\\w*)(?=\\()`,"g");
  let out="", last=0, m;
  while((m=re.exec(src))){ out += esc(src.slice(last,m.index));
    const cls = m[1]?"c":m[2]?"s":m[3]?"a":m[4]?"k":m[5]?"n":m[6]?"a":"fn";
    out += `<span class="${cls}">${esc(m[0])}</span>`; last = re.lastIndex; }
  out += esc(src.slice(last));
  if(changed) out = out.split("\n").map(l=>changed.some(n=>l.includes(`>${n}<`)||l.includes(` ${n}:`)) && l.includes("@export") ? `<span class="chg">${l}</span>` : l).join("\n");
  return out;
}

const cats = ["All", ...new Set(R.map(r=>r.cat))];
let cat = "All", q = "";
try{ cat = localStorage.getItem("gd-cat") || "All"; if(!cats.includes(cat)) cat="All"; }catch(e){}
const chips = document.getElementById("chips") || document.createElement("div");
cats.forEach(c=>{ const b=document.createElement("button"); b.className="chip"; b.textContent=c; b.type="button";
  b.addEventListener("click",()=>{cat=c; try{localStorage.setItem("gd-cat",c)}catch(e){} render();}); chips.appendChild(b); });

function inl(t){ const parts=t.split("\n"); return esc(parts[0])+(parts.length>1?`<code>${esc(parts.slice(1).join("\n"))}</code>`:""); }
function setupHTML(i){ const S=SETUP[R[i].title]; return `<div><h4>Scene tree</h4><pre>${esc(S.tree)}</pre></div>
  <div><h4>Steps</h4><ol>${S.steps.map(x=>`<li>${inl(x)}</li>`).join("")}</ol></div>
  <p class="runline"><b>Run it</b>${esc(S.run)}</p>`; }
function slugOf(t){ return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
function fbForm(recipe,i){ return `<form class="fb" data-recipe="${esc(recipe)}" data-t="${Date.now()}" novalidate>
  <h4>${recipe==="general"?"Send feedback":"Feedback on this recipe"}</h4>
  <div class="fbrow"><label for="fbt${i}">Type</label><select id="fbt${i}" name="type"><option value="bug">Bug: something doesn't work</option><option value="feature">Feature: add or improve something</option><option value="question">Question</option></select></div>
  <div class="fbrow"><label for="fbm${i}">What happened, or what would you like?</label><textarea id="fbm${i}" name="message" rows="4" maxlength="4000" required placeholder="${recipe==="general"?"e.g. Please add a wall jump recipe":"e.g. The player falls through the floor in Godot 4.3 after step 4"}"></textarea></div>
  <div class="fbrow"><label for="fbe${i}">Email (optional, only if you want a reply)</label><input id="fbe${i}" name="email" type="email" maxlength="200" autocomplete="email"></div>
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="fbactions"><button class="btn" type="submit">Send</button><span class="fbstatus" role="status"></span></div>
</form>`; }
function relatedHTML(){ if(!PAGE.slug) return ""; const me=R.find(r=>slugOf(r.title)===PAGE.slug); if(!me) return "";
  const rel=R.filter(r=>r!==me&&r.cat===me.cat).concat(R.filter(r=>r!==me&&r.cat!==me.cat)).slice(0,6);
  return `<section class="related"><h3>More recipes</h3><ul>${rel.map(r=>`<li><a href="/recipes/${slugOf(r.title)}/">${esc(r.title)}</a><span>${esc(r.cat)}</span></li>`).join("")}</ul><p><a href="/">← All ${R.length} recipes</a></p></section>`; }
function changedNames(i){ return Object.keys(VALS[i]).filter(k=>VALS[i][k].v!==VALS[i][k].def); }
function tuneHTML(i){ const r=R[i], names=Object.keys(VALS[i]); if(!names.length) return "";
  return `<div><h3>Tune it <button class="btn reset" type="button" data-reset="${i}">Reset</button></h3><div class="tune">${names.map(n=>{ const d=VALS[i][n], [mn,mx,sp]=rangeFor(r,n,d);
    return `<label for="r${i}-${n}"><span>${n}</span><output id="o${i}-${n}">${fmt(d,d.v)}</output><input type="range" id="r${i}-${n}" data-i="${i}" data-n="${n}" min="${mn}" max="${mx}" step="${sp}" value="${d.v}"></label>`; }).join("")}</div></div>`; }

function render(){
  [...chips.children].forEach(b=>b.setAttribute("aria-pressed", b.textContent===cat));
  const list=document.getElementById("list"); if(!list) return;
  const items=R.map((r,i)=>[r,i]).filter(([r])=> PAGE.slug ? slugOf(r.title)===PAGE.slug : (cat==="All"||r.cat===cat) &&
    (!q || (r.title+" "+r.desc+" "+r.code+" "+r.node+" "+r.cat).toLowerCase().includes(q)));
  const cnt=document.getElementById("count"); if(cnt) cnt.textContent = `${items.length} of ${R.length}`;
  if(!items.length){ list.innerHTML=`<p class="empty">No recipes match “${esc(q)}”. Try another word or pick All.</p>`; return; }
  list.innerHTML = items.map(([r,i])=>`
    <article class="recipe" data-i="${i}">
      <div class="rhead"><h2>${PAGE.slug?esc(r.title):`<a href="/recipes/${slugOf(r.title)}/">${esc(r.title)}</a>`}</h2>
        <div class="meta">${r.isNew?'<span class="tag new">new</span>':""}<span class="tag node">${esc(r.node)}</span><span class="tag">${esc(r.cat)}</span></div></div>
      <p class="desc">${esc(r.desc)}</p>
      <div class="setupbar"><button class="btn setupbtn" type="button" data-setup="${i}" aria-expanded="false" aria-controls="setup${i}">Setup guide</button><button class="btn alt" type="button" data-fb="${i}" aria-expanded="false" aria-controls="fb${i}">Report a bug / suggest</button><span class="tag">${SETUP[r.title].steps.length} steps · scene tree</span></div>
      <div class="setup" id="setup${i}" hidden>${setupHTML(i)}</div>
      <div id="fb${i}" hidden>${fbForm(r.title,i)}</div>
      <div class="body">
        <div class="codebox"><button class="btn copy" type="button" data-i="${i}">Copy</button><pre><code id="code${i}">${hl(codeOf(i),changedNames(i))}</code></pre></div>
        <div class="side">
          <figure class="viz"><canvas data-d="${i}" tabindex="0" aria-label="Interactive preview: ${esc(r.title)}"></canvas>
            <figcaption><span>${esc(r.cap)}</span>${r.try?`<span class="try">▸ ${esc(r.try)}</span>`:""}</figcaption></figure>
          ${tuneHTML(i)}
          <div><h3>Variables &amp; calls</h3><dl>${r.vars.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>
        </div>
      </div>
      <div class="mistakes"><h3>Common mistakes</h3><ul>${(MISTAKES[r.title]||[]).map(([a,b])=>`<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ul></div>
    </article>`).join("") + relatedHTML();
  observeCanvases();
}

const listEl=document.getElementById("list") || document.createElement("div");
listEl.addEventListener("input",e=>{ const el=e.target; if(el.type!=="range") return; const i=+el.dataset.i, n=el.dataset.n, d=VALS[i][n];
  d.v=+el.value; document.getElementById(`o${i}-${n}`).textContent=fmt(d,d.v); document.getElementById(`code${i}`).innerHTML=hl(codeOf(i),changedNames(i)); });
listEl.addEventListener("click",e=>{
  const rs=e.target.closest("[data-reset]"); if(rs){ const i=+rs.dataset.reset; for(const n in VALS[i]){ const d=VALS[i][n]; d.v=d.def; const inp=document.getElementById(`r${i}-${n}`); if(inp){ inp.value=d.def; document.getElementById(`o${i}-${n}`).textContent=fmt(d,d.v);} }
    document.getElementById(`code${i}`).innerHTML=hl(codeOf(i),[]); const cv=document.querySelector(`canvas[data-d="${i}"]`); if(cv) stOf(cv).s=null; return; }
  const fbb=e.target.closest("[data-fb]"); if(fbb){ const p=document.getElementById("fb"+fbb.dataset.fb), open=p.hidden; p.hidden=!open; fbb.setAttribute("aria-expanded",open); if(open) p.querySelector("textarea").focus(); return; }
  const sb=e.target.closest("[data-setup]"); if(sb){ const p=document.getElementById("setup"+sb.dataset.setup), open=p.hidden; p.hidden=!open; sb.setAttribute("aria-expanded",open); sb.textContent=open?"Hide setup":"Setup guide"; return; }
  const b=e.target.closest(".copy"); if(!b) return; const text=codeOf(+b.dataset.i);
  const done=()=>{b.textContent="Copied"; setTimeout(()=>b.textContent="Copy",1400);};
  try{ navigator.clipboard.writeText(text).then(done).catch(()=>selectCode(b)); }catch(err){ selectCode(b); } });
function selectCode(b){ const code=b.parentElement.querySelector("code"); const r=document.createRange(); r.selectNodeContents(code);
  const s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent="Press Ctrl+C"; }
if(document.getElementById("gsteps")) document.getElementById("gsteps").innerHTML=GETTING_STARTED.map(([h,t],n)=>`<li><span class="num">Step ${n+1}</span><b>${esc(h)}</b><span>${esc(t)}</span></li>`).join("");
document.getElementById("gsBtn")?.addEventListener("click",e=>{ const g=document.getElementById("guide"), open=g.hidden; g.hidden=!open; e.currentTarget.setAttribute("aria-expanded",open); e.currentTarget.textContent=open?"Close guide":"Getting started"; if(open) g.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"}); });
document.getElementById("q")?.addEventListener("input",e=>{q=e.target.value.trim().toLowerCase(); render();});
if(PAGE.slug){ const b=document.querySelector(".bar"); if(b) b.hidden=true; }
render();
const gfb=document.getElementById("generalfb"); if(gfb) gfb.innerHTML=fbForm("general","g");
document.addEventListener("submit",async e=>{ const f=e.target.closest("form.fb"); if(!f) return; e.preventDefault();
  const st=f.querySelector(".fbstatus"), btn=f.querySelector("button[type=submit]"), fd=new FormData(f), msg=String(fd.get("message")||"").trim();
  if(msg.length<5){ st.textContent="Please describe it in a few more words."; st.className="fbstatus err"; return; }
  if(Date.now()-(+f.dataset.t)<2500){ st.textContent="Please wait a moment and send again."; st.className="fbstatus err"; return; }
  btn.disabled=true; st.textContent="Sending…"; st.className="fbstatus";
  try{ const r=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:fd.get("type"),message:msg,email:fd.get("email"),website:fd.get("website"),recipe:f.dataset.recipe,page:location.pathname})});
    const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||"Could not send. Try again in a minute.");
    f.reset(); st.textContent="Sent. Thanks, I read every message."; st.className="fbstatus ok";
  }catch(err){ st.textContent=err.message; st.className="fbstatus err"; } finally{ btn.disabled=false; } });
