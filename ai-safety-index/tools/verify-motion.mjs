import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'portal-motion.js'),'utf8');
function setup({reduced=false,intersection=true}={}){
 const calls=[],observers=[],mutations=[],listeners={};
 function el(){return {dataset:{},isConnected:true,contains:()=>false,animate(frames,timing){const a={frames,timing,cancelled:false,cancel(){this.cancelled=true},finished:new Promise(()=>{})};calls.push(a);return a}}}
 const first=el(),second=el(),heading=el();let page={};let cards=[first,second];
 const main={get firstElementChild(){return page},querySelectorAll:()=>cards,querySelector:s=>s.includes('img')?null:heading};
 const preference={matches:reduced,addEventListener(type,fn){listeners.preference=fn}};
 const document={querySelector:()=>main,activeElement:null,hidden:false,addEventListener(type,fn){listeners[type]=fn}};
 class IO{constructor(fn){this.fn=fn;this.watched=new Set();observers.push(this)}observe(e){this.watched.add(e)}unobserve(e){this.watched.delete(e)}disconnect(){this.watched.clear()}}
 class MO{constructor(fn){this.fn=fn;mutations.push(this)}observe(target,opts){this.opts=opts;this.target=target}}
 const c=vm.createContext({document,location:{hash:'#home'},window:{matchMedia:()=>preference},MutationObserver:MO,...(intersection?{IntersectionObserver:IO}:{}),console});
 vm.runInContext(source,c);
 return {calls,observers,mutations,listeners,first,second,preference,main,document,next(){page={};cards=[el()];mutations[0].fn([{type:'childList',target:main}]);return cards[0]}};
}
let s=setup();assert.equal(s.observers[0].watched.size,2);
let baseline=s.calls.length;s.observers[0].fn([{target:s.first,isIntersecting:true}]);assert.equal(s.calls.length,baseline+1);assert.equal(s.first.dataset.motionState,'shown');
s.observers[0].fn([{target:s.first,isIntersecting:true}]);assert.equal(s.calls.length,baseline+1,'A card should not replay after being revealed');
s.mutations[0].fn([{type:'characterData',target:s.main}]);assert.equal(s.calls.length,baseline+1,'Locale text updates must not replay entrances');
assert.equal(s.mutations[0].opts.subtree,undefined,'Observe route replacement, not translated descendants');
s.preference.matches=true;s.listeners.preference();assert.ok(s.calls.every(a=>a.cancelled),'Reduced-motion changes must cancel active animations');
s=setup();s.observers[0].fn([{target:s.first,isIntersecting:true}]);s.document.hidden=true;s.listeners.visibilitychange();assert.ok(s.calls.every(a=>a.cancelled));assert.ok(s.observers[0].watched.has(s.second),'Tab hiding must retain pending scroll observations');
s=setup({reduced:true});assert.equal(s.calls.length,0);assert.equal(s.observers.length,0,'Reduced motion must not queue scroll effects');
s=setup();s.observers[0].fn([{target:s.first,isIntersecting:true}]);const old=[...s.calls];const newCard=s.next();assert.ok(old.every(a=>a.cancelled),'Fast navigation must cancel old page effects');assert.ok(s.observers.at(-1).watched.has(newCard));
s=setup({intersection:false});assert.equal(s.first.dataset.motionState,'shown','Unsupported observers must leave cards available');
assert.ok(!/location\.(hash|href)\s*=|location\.(reload|replace|assign)\(/.test(source),'Motion must not navigate');
console.log('Motion checks passed: one-time card entrances, locale continuity, reduced motion, navigation cancellation, visible fallback.');
