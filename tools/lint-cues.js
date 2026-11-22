#!/usr/bin/env node
/* Linter anti-cues — règles issues des audits croisés Opus 5 / GPT-5.6 (août 2026).
   Usage: node tools/lint-cues.js [--cert ccar-p|ccdv-p|all] [--list] — code retour 1 si des items sont flagués.
   Les items "exam-guide-sample" (officiels, non modifiables) sont exclus du contrôle. */
const path=require('path'), fs=require('fs');
global.window={};
const argCert=(process.argv[process.argv.indexOf('--cert')+1]||'all');
const certs=fs.readdirSync(path.join(process.cwd(),'data'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name)
  .filter(c=>argCert==='all'||process.argv.indexOf('--cert')<0||c===argCert);
certs.forEach(c=>fs.readdirSync(path.join(process.cwd(),'data',c)).filter(f=>/^questions-d\d+\.js$/.test(f))
  .forEach(f=>require(path.join(process.cwd(),'data',c,f))));
const HARD_ONLY=false;
const Q=certs.flatMap(c=>(window.BANK[c]||[]).map(q=>Object.assign({},q,{id:c+':'+q.id}))).filter(q=>q.source!=='exam-guide-sample');
const RATIONALE=/,\s+(since|because|keeping|making|letting|giving|preserving|breaking|guaranteeing|restoring|trading|sorting|committing|so\s)/;
const ABSOLUTE=/\b(always|never|every|entirely|outright|forever|nothing:)|full stop/i;
const JARGON=/\b(scoped|per-|bounded|explicit|structured|versioned|deterministic)\b/i;
const flags={};
function flag(q,code){(flags[q.id]=flags[q.id]||new Set()).add(code);}
for(const q of Q){
  const K=q.correct, opts=q.options;
  const isK=i=>K.includes(i);
  const has=(re,i)=>re.test(opts[i]);
  const kHas=re=>K.some(i=>has(re,i)), dHas=re=>opts.some((_,i)=>!isK(i)&&has(re,i));
  if(dHas(RATIONALE)!==kHas(RATIONALE)) flag(q,'R1-rationale');
  if(dHas(ABSOLUTE)&&!kHas(ABSOLUTE)) flag(q,'R2-absolute');
  const PUNCT=/[:—;]/;
  if(kHas(PUNCT)&&!dHas(PUNCT)) flag(q,'R3-punct');
  const C2=o=>(o.match(/,/g)||[]).length>=2;
  if(K.some(i=>C2(opts[i])) && !opts.some((o,i)=>!isK(i)&&C2(o))) flag(q,'R4-enum');
  if(q.type==='single'){
    const lens=opts.map(o=>o.length);
    const sorted=[...lens].sort((a,b)=>a-b);
    const median=(sorted[1]+sorted[2])/2;
    if(median>=40){ // les options ultra-courtes (valeurs numériques) sont exemptées
      if(lens[K[0]]===Math.max(...lens)&&lens[K[0]]>median*1.15) flag(q,'R5-band-high');
      if(lens[K[0]]===Math.min(...lens)&&lens[K[0]]<median*0.85) flag(q,'R5-band-low');
      if(sorted[3]/sorted[0]>1.6) flag(q,'R5-spread');
    }
  }
  if(kHas(JARGON)&&!dHas(JARGON)) flag(q,'R6-register');
}
const ids=Object.keys(flags);
const byRule={};
ids.forEach(id=>flags[id].forEach(c=>byRule[c]=(byRule[c]||0)+1));
console.log('lint-cues — items:',Q.length,(HARD_ONLY?'(hard only)':''),'| flagués:',ids.length,'('+Math.round(100*ids.length/Q.length)+'%)');
console.log('par règle:',JSON.stringify(byRule));
if(process.argv.includes('--list')) ids.forEach(id=>console.log(id,[...flags[id]].join(',')));
process.exit(ids.length>0?1:0);
