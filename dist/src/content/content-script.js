function k(t){return Array.isArray?Array.isArray(t):de(t)==="[object Array]"}function Ce(t){if(typeof t=="string")return t;let e=t+"";return e=="0"&&1/t==-1/0?"-0":e}function Me(t){return t==null?"":Ce(t)}function M(t){return typeof t=="string"}function le(t){return typeof t=="number"}function ve(t){return t===!0||t===!1||we(t)&&de(t)=="[object Boolean]"}function he(t){return typeof t=="object"}function we(t){return he(t)&&t!==null}function x(t){return t!=null}function U(t){return!t.trim().length}function de(t){return t==null?t===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(t)}const ke="Incorrect 'index' type",Be=t=>`Invalid value for key ${t}`,Fe=t=>`Pattern length exceeds max of ${t}.`,De=t=>`Missing ${t} property in key`,Le=t=>`Property 'weight' in key '${t}' must be a positive integer`,ie=Object.prototype.hasOwnProperty;class Ie{constructor(e){this._keys=[],this._keyMap={};let s=0;e.forEach(n=>{let i=fe(n);this._keys.push(i),this._keyMap[i.id]=i,s+=i.weight}),this._keys.forEach(n=>{n.weight/=s})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function fe(t){let e=null,s=null,n=null,i=1,r=null;if(M(t)||k(t))n=t,e=re(t),s=J(t);else{if(!ie.call(t,"name"))throw new Error(De("name"));const o=t.name;if(n=o,ie.call(t,"weight")&&(i=t.weight,i<=0))throw new Error(Le(o));e=re(o),s=J(o),r=t.getFn}return{path:e,id:s,weight:i,src:n,getFn:r}}function re(t){return k(t)?t:t.split(".")}function J(t){return k(t)?t.join("."):t}function Se(t,e){let s=[],n=!1;const i=(r,o,c)=>{if(x(r))if(!o[c])s.push(r);else{let a=o[c];const u=r[a];if(!x(u))return;if(c===o.length-1&&(M(u)||le(u)||ve(u)))s.push(Me(u));else if(k(u)){n=!0;for(let l=0,d=u.length;l<d;l+=1)i(u[l],o,c+1)}else o.length&&i(u,o,c+1)}};return i(t,M(e)?e.split("."):e,0),n?s:s[0]}const _e={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},$e={isCaseSensitive:!1,ignoreDiacritics:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(t,e)=>t.score===e.score?t.idx<e.idx?-1:1:t.score<e.score?-1:1},Re={location:0,threshold:.6,distance:100},Te={useExtendedSearch:!1,getFn:Se,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var h={...$e,..._e,...Re,...Te};const ze=/[^ ]+/g;function Oe(t=1,e=3){const s=new Map,n=Math.pow(10,e);return{get(i){const r=i.match(ze).length;if(s.has(r))return s.get(r);const o=1/Math.pow(r,.5*t),c=parseFloat(Math.round(o*n)/n);return s.set(r,c),c},clear(){s.clear()}}}class te{constructor({getFn:e=h.getFn,fieldNormWeight:s=h.fieldNormWeight}={}){this.norm=Oe(s,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((s,n)=>{this._keysMap[s.id]=n})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,M(this.docs[0])?this.docs.forEach((e,s)=>{this._addString(e,s)}):this.docs.forEach((e,s)=>{this._addObject(e,s)}),this.norm.clear())}add(e){const s=this.size();M(e)?this._addString(e,s):this._addObject(e,s)}removeAt(e){this.records.splice(e,1);for(let s=e,n=this.size();s<n;s+=1)this.records[s].i-=1}getValueForItemAtKeyId(e,s){return e[this._keysMap[s]]}size(){return this.records.length}_addString(e,s){if(!x(e)||U(e))return;let n={v:e,i:s,n:this.norm.get(e)};this.records.push(n)}_addObject(e,s){let n={i:s,$:{}};this.keys.forEach((i,r)=>{let o=i.getFn?i.getFn(e):this.getFn(e,i.path);if(x(o)){if(k(o)){let c=[];const a=[{nestedArrIndex:-1,value:o}];for(;a.length;){const{nestedArrIndex:u,value:l}=a.pop();if(x(l))if(M(l)&&!U(l)){let d={v:l,i:u,n:this.norm.get(l)};c.push(d)}else k(l)&&l.forEach((d,f)=>{a.push({nestedArrIndex:f,value:d})})}n.$[r]=c}else if(M(o)&&!U(o)){let c={v:o,n:this.norm.get(o)};n.$[r]=c}}}),this.records.push(n)}toJSON(){return{keys:this.keys,records:this.records}}}function pe(t,e,{getFn:s=h.getFn,fieldNormWeight:n=h.fieldNormWeight}={}){const i=new te({getFn:s,fieldNormWeight:n});return i.setKeys(t.map(fe)),i.setSources(e),i.create(),i}function Ne(t,{getFn:e=h.getFn,fieldNormWeight:s=h.fieldNormWeight}={}){const{keys:n,records:i}=t,r=new te({getFn:e,fieldNormWeight:s});return r.setKeys(n),r.setIndexRecords(i),r}function N(t,{errors:e=0,currentLocation:s=0,expectedLocation:n=0,distance:i=h.distance,ignoreLocation:r=h.ignoreLocation}={}){const o=e/t.length;if(r)return o;const c=Math.abs(n-s);return i?o+c/i:c?1:o}function Pe(t=[],e=h.minMatchCharLength){let s=[],n=-1,i=-1,r=0;for(let o=t.length;r<o;r+=1){let c=t[r];c&&n===-1?n=r:!c&&n!==-1&&(i=r-1,i-n+1>=e&&s.push([n,i]),n=-1)}return t[r-1]&&r-n>=e&&s.push([n,r-1]),s}const _=32;function je(t,e,s,{location:n=h.location,distance:i=h.distance,threshold:r=h.threshold,findAllMatches:o=h.findAllMatches,minMatchCharLength:c=h.minMatchCharLength,includeMatches:a=h.includeMatches,ignoreLocation:u=h.ignoreLocation}={}){if(e.length>_)throw new Error(Fe(_));const l=e.length,d=t.length,f=Math.max(0,Math.min(n,d));let p=r,g=f;const A=c>1||a,b=A?Array(d):[];let B;for(;(B=t.indexOf(e,g))>-1;){let y=N(e,{currentLocation:B,expectedLocation:f,distance:i,ignoreLocation:u});if(p=Math.min(y,p),g=B+l,A){let F=0;for(;F<l;)b[B+F]=1,F+=1}}g=-1;let w=[],$=1,S=l+d;const be=1<<l-1;for(let y=0;y<l;y+=1){let F=0,D=S;for(;F<D;)N(e,{errors:y,currentLocation:f+D,expectedLocation:f,distance:i,ignoreLocation:u})<=p?F=D:S=D,D=Math.floor((S-F)/2+F);S=D;let se=Math.max(1,f-D+1),V=o?d:Math.min(f+D,d)+l,R=Array(V+2);R[V+1]=(1<<y)-1;for(let C=V;C>=se;C-=1){let O=C-1,ne=s[t.charAt(O)];if(A&&(b[O]=+!!ne),R[C]=(R[C+1]<<1|1)&ne,y&&(R[C]|=(w[C+1]|w[C])<<1|1|w[C+1]),R[C]&be&&($=N(e,{errors:y,currentLocation:O,expectedLocation:f,distance:i,ignoreLocation:u}),$<=p)){if(p=$,g=O,g<=f)break;se=Math.max(1,2*f-g)}}if(N(e,{errors:y+1,currentLocation:f,expectedLocation:f,distance:i,ignoreLocation:u})>p)break;w=R}const Y={isMatch:g>=0,score:Math.max(.001,$)};if(A){const y=Pe(b,c);y.length?a&&(Y.indices=y):Y.isMatch=!1}return Y}function Ge(t){let e={};for(let s=0,n=t.length;s<n;s+=1){const i=t.charAt(s);e[i]=(e[i]||0)|1<<n-s-1}return e}const j=String.prototype.normalize?t=>t.normalize("NFD").replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g,""):t=>t;class ge{constructor(e,{location:s=h.location,threshold:n=h.threshold,distance:i=h.distance,includeMatches:r=h.includeMatches,findAllMatches:o=h.findAllMatches,minMatchCharLength:c=h.minMatchCharLength,isCaseSensitive:a=h.isCaseSensitive,ignoreDiacritics:u=h.ignoreDiacritics,ignoreLocation:l=h.ignoreLocation}={}){if(this.options={location:s,threshold:n,distance:i,includeMatches:r,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:a,ignoreDiacritics:u,ignoreLocation:l},e=a?e:e.toLowerCase(),e=u?j(e):e,this.pattern=e,this.chunks=[],!this.pattern.length)return;const d=(p,g)=>{this.chunks.push({pattern:p,alphabet:Ge(p),startIndex:g})},f=this.pattern.length;if(f>_){let p=0;const g=f%_,A=f-g;for(;p<A;)d(this.pattern.substr(p,_),p),p+=_;if(g){const b=f-_;d(this.pattern.substr(b),b)}}else d(this.pattern,0)}searchIn(e){const{isCaseSensitive:s,ignoreDiacritics:n,includeMatches:i}=this.options;if(e=s?e:e.toLowerCase(),e=n?j(e):e,this.pattern===e){let A={isMatch:!0,score:0};return i&&(A.indices=[[0,e.length-1]]),A}const{location:r,distance:o,threshold:c,findAllMatches:a,minMatchCharLength:u,ignoreLocation:l}=this.options;let d=[],f=0,p=!1;this.chunks.forEach(({pattern:A,alphabet:b,startIndex:B})=>{const{isMatch:w,score:$,indices:S}=je(e,A,b,{location:r+B,distance:o,threshold:c,findAllMatches:a,minMatchCharLength:u,includeMatches:i,ignoreLocation:l});w&&(p=!0),f+=$,w&&S&&(d=[...d,...S])});let g={isMatch:p,score:p?f/this.chunks.length:1};return p&&i&&(g.indices=d),g}}class I{constructor(e){this.pattern=e}static isMultiMatch(e){return oe(e,this.multiRegex)}static isSingleMatch(e){return oe(e,this.singleRegex)}search(){}}function oe(t,e){const s=t.match(e);return s?s[1]:null}class He extends I{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const s=e===this.pattern;return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Ke extends I{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const n=e.indexOf(this.pattern)===-1;return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}}class We extends I{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const s=e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Ye extends I{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const s=!e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class Ve extends I{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const s=e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class Ue extends I{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const s=!e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class me extends I{constructor(e,{location:s=h.location,threshold:n=h.threshold,distance:i=h.distance,includeMatches:r=h.includeMatches,findAllMatches:o=h.findAllMatches,minMatchCharLength:c=h.minMatchCharLength,isCaseSensitive:a=h.isCaseSensitive,ignoreDiacritics:u=h.ignoreDiacritics,ignoreLocation:l=h.ignoreLocation}={}){super(e),this._bitapSearch=new ge(e,{location:s,threshold:n,distance:i,includeMatches:r,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:a,ignoreDiacritics:u,ignoreLocation:l})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class Ae extends I{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let s=0,n;const i=[],r=this.pattern.length;for(;(n=e.indexOf(this.pattern,s))>-1;)s=n+r,i.push([n,s-1]);const o=!!i.length;return{isMatch:o,score:o?0:1,indices:i}}}const q=[He,Ae,We,Ye,Ue,Ve,Ke,me],ce=q.length,Je=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,qe="|";function Qe(t,e={}){return t.split(qe).map(s=>{let n=s.trim().split(Je).filter(r=>r&&!!r.trim()),i=[];for(let r=0,o=n.length;r<o;r+=1){const c=n[r];let a=!1,u=-1;for(;!a&&++u<ce;){const l=q[u];let d=l.isMultiMatch(c);d&&(i.push(new l(d,e)),a=!0)}if(!a)for(u=-1;++u<ce;){const l=q[u];let d=l.isSingleMatch(c);if(d){i.push(new l(d,e));break}}}return i})}const Xe=new Set([me.type,Ae.type]);class Ze{constructor(e,{isCaseSensitive:s=h.isCaseSensitive,ignoreDiacritics:n=h.ignoreDiacritics,includeMatches:i=h.includeMatches,minMatchCharLength:r=h.minMatchCharLength,ignoreLocation:o=h.ignoreLocation,findAllMatches:c=h.findAllMatches,location:a=h.location,threshold:u=h.threshold,distance:l=h.distance}={}){this.query=null,this.options={isCaseSensitive:s,ignoreDiacritics:n,includeMatches:i,minMatchCharLength:r,findAllMatches:c,ignoreLocation:o,location:a,threshold:u,distance:l},e=s?e:e.toLowerCase(),e=n?j(e):e,this.pattern=e,this.query=Qe(this.pattern,this.options)}static condition(e,s){return s.useExtendedSearch}searchIn(e){const s=this.query;if(!s)return{isMatch:!1,score:1};const{includeMatches:n,isCaseSensitive:i,ignoreDiacritics:r}=this.options;e=i?e:e.toLowerCase(),e=r?j(e):e;let o=0,c=[],a=0;for(let u=0,l=s.length;u<l;u+=1){const d=s[u];c.length=0,o=0;for(let f=0,p=d.length;f<p;f+=1){const g=d[f],{isMatch:A,indices:b,score:B}=g.search(e);if(A){if(o+=1,a+=B,n){const w=g.constructor.type;Xe.has(w)?c=[...c,...b]:c.push(b)}}else{a=0,o=0,c.length=0;break}}if(o){let f={isMatch:!0,score:a/o};return n&&(f.indices=c),f}}return{isMatch:!1,score:1}}}const Q=[];function et(...t){Q.push(...t)}function X(t,e){for(let s=0,n=Q.length;s<n;s+=1){let i=Q[s];if(i.condition(t,e))return new i(t,e)}return new ge(t,e)}const G={AND:"$and",OR:"$or"},Z={PATH:"$path",PATTERN:"$val"},ee=t=>!!(t[G.AND]||t[G.OR]),tt=t=>!!t[Z.PATH],st=t=>!k(t)&&he(t)&&!ee(t),ae=t=>({[G.AND]:Object.keys(t).map(e=>({[e]:t[e]}))});function xe(t,e,{auto:s=!0}={}){const n=i=>{let r=Object.keys(i);const o=tt(i);if(!o&&r.length>1&&!ee(i))return n(ae(i));if(st(i)){const a=o?i[Z.PATH]:r[0],u=o?i[Z.PATTERN]:i[a];if(!M(u))throw new Error(Be(a));const l={keyId:J(a),pattern:u};return s&&(l.searcher=X(u,e)),l}let c={children:[],operator:r[0]};return r.forEach(a=>{const u=i[a];k(u)&&u.forEach(l=>{c.children.push(n(l))})}),c};return ee(t)||(t=ae(t)),n(t)}function nt(t,{ignoreFieldNorm:e=h.ignoreFieldNorm}){t.forEach(s=>{let n=1;s.matches.forEach(({key:i,norm:r,score:o})=>{const c=i?i.weight:null;n*=Math.pow(o===0&&c?Number.EPSILON:o,(c||1)*(e?1:r))}),s.score=n})}function it(t,e){const s=t.matches;e.matches=[],x(s)&&s.forEach(n=>{if(!x(n.indices)||!n.indices.length)return;const{indices:i,value:r}=n;let o={indices:i,value:r};n.key&&(o.key=n.key.src),n.idx>-1&&(o.refIndex=n.idx),e.matches.push(o)})}function rt(t,e){e.score=t.score}function ot(t,e,{includeMatches:s=h.includeMatches,includeScore:n=h.includeScore}={}){const i=[];return s&&i.push(it),n&&i.push(rt),t.map(r=>{const{idx:o}=r,c={item:e[o],refIndex:o};return i.length&&i.forEach(a=>{a(r,c)}),c})}class L{constructor(e,s={},n){this.options={...h,...s},this.options.useExtendedSearch,this._keyStore=new Ie(this.options.keys),this.setCollection(e,n)}setCollection(e,s){if(this._docs=e,s&&!(s instanceof te))throw new Error(ke);this._myIndex=s||pe(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){x(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const s=[];for(let n=0,i=this._docs.length;n<i;n+=1){const r=this._docs[n];e(r,n)&&(this.removeAt(n),n-=1,i-=1,s.push(r))}return s}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:s=-1}={}){const{includeMatches:n,includeScore:i,shouldSort:r,sortFn:o,ignoreFieldNorm:c}=this.options;let a=M(e)?M(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return nt(a,{ignoreFieldNorm:c}),r&&a.sort(o),le(s)&&s>-1&&(a=a.slice(0,s)),ot(a,this._docs,{includeMatches:n,includeScore:i})}_searchStringList(e){const s=X(e,this.options),{records:n}=this._myIndex,i=[];return n.forEach(({v:r,i:o,n:c})=>{if(!x(r))return;const{isMatch:a,score:u,indices:l}=s.searchIn(r);a&&i.push({item:r,idx:o,matches:[{score:u,value:r,norm:c,indices:l}]})}),i}_searchLogical(e){const s=xe(e,this.options),n=(c,a,u)=>{if(!c.children){const{keyId:d,searcher:f}=c,p=this._findMatches({key:this._keyStore.get(d),value:this._myIndex.getValueForItemAtKeyId(a,d),searcher:f});return p&&p.length?[{idx:u,item:a,matches:p}]:[]}const l=[];for(let d=0,f=c.children.length;d<f;d+=1){const p=c.children[d],g=n(p,a,u);if(g.length)l.push(...g);else if(c.operator===G.AND)return[]}return l},i=this._myIndex.records,r={},o=[];return i.forEach(({$:c,i:a})=>{if(x(c)){let u=n(s,c,a);u.length&&(r[a]||(r[a]={idx:a,item:c,matches:[]},o.push(r[a])),u.forEach(({matches:l})=>{r[a].matches.push(...l)}))}}),o}_searchObjectList(e){const s=X(e,this.options),{keys:n,records:i}=this._myIndex,r=[];return i.forEach(({$:o,i:c})=>{if(!x(o))return;let a=[];n.forEach((u,l)=>{a.push(...this._findMatches({key:u,value:o[l],searcher:s}))}),a.length&&r.push({idx:c,item:o,matches:a})}),r}_findMatches({key:e,value:s,searcher:n}){if(!x(s))return[];let i=[];if(k(s))s.forEach(({v:r,i:o,n:c})=>{if(!x(r))return;const{isMatch:a,score:u,indices:l}=n.searchIn(r);a&&i.push({score:u,key:e,value:r,idx:o,norm:c,indices:l})});else{const{v:r,n:o}=s,{isMatch:c,score:a,indices:u}=n.searchIn(r);c&&i.push({score:a,key:e,value:r,norm:o,indices:u})}return i}}L.version="7.1.0";L.createIndex=pe;L.parseIndex=Ne;L.config=h;L.parseQuery=xe;et(Ze);const ct="your-appscript-deployment-url";let E=null,m=null,T=null,v=0,H=[];async function W(){try{const t=await fetch(ct,{redirect:"follow"});if(!t.ok)throw new Error(`HTTP ${t.status}`);const e=await t.json(),s=Array.isArray(e)?e:e.items,n=Array.isArray(e)?"":e.email||"";if(!Array.isArray(s))throw new Error("Not an array");await chrome.storage.local.set({"gcs-index":JSON.stringify(s),"gcs-email":n,"gcs-last-updated":Date.now()}),T=null,console.log(`[GCS] Index stored — ${s.length} items`)}catch(t){throw console.error("[GCS] fetch failed",t),t}}function at(t){if(t.startsWith(">")){const s=t.slice(1).trim().split(" "),n=s[0]||"",i=s.slice(1).join(" ").trim();return{mode:"type",filter:n.toLowerCase(),subquery:i}}if(t.startsWith("#")){const e=t.slice(1).trim(),s=e.search(/\s/),n=s===-1?e:e.slice(0,s),i=s===-1?"":e.slice(s+1).trim();return{mode:"course",filter:n.toLowerCase(),subquery:i}}return{mode:"fuzzy",query:t}}function ut(t,e){if(e.mode==="type"){const n={assignment:"Assignment",assignments:"Assignment",material:"Material",materials:"Material",announcement:"Announcement",announcements:"Announcement"}[e.filter]||e.filter;let i=t.filter(r=>r.type.toLowerCase().includes(n.toLowerCase()));return e.subquery&&(i=new L(i,{keys:["title","course"],threshold:.35}).search(e.subquery).map(o=>o.item)),i}if(e.mode==="course"){const s=e.filter.replace(/\s+/g,"").toLowerCase();let n=t.filter(i=>i.course.replace(/\s+/g,"").toLowerCase().includes(s));return e.subquery&&(n=new L(n,{keys:["title","type"],threshold:.35}).search(e.subquery).map(r=>r.item)),n}return e.query?(T||(T=new L(t,{keys:["title","course","type"],threshold:.35,includeScore:!0,minMatchCharLength:1})),T.search(e.query).map(s=>s.item)):t}function lt(){return`
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&family=Google+Sans+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      #overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.55);
        z-index: 2147483647; display: flex; align-items: flex-start;
        justify-content: center; padding-top: 14vh; font-family: 'Geist', sans-serif;
      }
      #palette {
        width: 640px; background: #242424; border-radius: 12px;
        border: 1px solid #333; overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        animation: drop 0.15s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes drop {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #search-row {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px; border-bottom: 1px solid #2e2e2e;
      }
      .search-icon { color: #555; flex-shrink: 0; }
      #search-input {
        flex: 1; background: none; border: none; outline: none;
        color: #e8e8e8; font-size: 15px; font-family: 'Geist', sans-serif;
        letter-spacing: -0.01em;
      }
      #search-input::placeholder { color: #3a3a3a; }
      .kbd {
        background: #2e2e2e; border: 1px solid #3a3a3a; border-radius: 5px;
        padding: 2px 6px; font-size: 11px; color: #555; font-family: 'Geist Mono', monospace;
        flex-shrink: 0;
      }
      #results { max-height: 400px; overflow-y: auto; }
      #results::-webkit-scrollbar { width: 4px; }
      #results::-webkit-scrollbar-track { background: transparent; }
      #results::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      .section-label {
        padding: 8px 16px 4px; font-size: 11px; color: #555;
        letter-spacing: 0.06em; text-transform: uppercase; font-family: 'Geist Mono', monospace;
      }
      .result-item {
        display: flex; align-items: center; gap: 12px; padding: 8px 16px;
        cursor: pointer; border-left: 2px solid transparent; transition: background 0.08s;
      }
      .result-item:hover, .result-item.active { background: #2e2e2e; border-left-color: #5b6af0; }
      .result-item.active .item-title { color: #fff; }
      .item-icon {
        width: 30px; height: 30px; border-radius: 7px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .icon-Assignment   { background: #1e2d1e; }
      .icon-Material     { background: #1a2333; }
      .icon-Announcement { background: #2a1f2e; }
      .icon-Class        { background: #2a2010; }
      .item-body { flex: 1; min-width: 0; }
      .item-title {
        font-size: 13.5px; color: #ccc; font-weight: 500;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .item-title .match { color: #fff; font-weight: 600; }
      .item-meta {
        font-size: 11.5px; color: #555; margin-top: 1px;
        font-family: 'Geist Mono', monospace;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .item-type { font-size: 11px; color: #444; font-family: 'Geist Mono', monospace; flex-shrink: 0; }
      #footer {
        display: flex; align-items: center; justify-content: space-between;
        padding: 9px 16px; border-top: 1px solid #2e2e2e;
      }
      .footer-left { display: flex; gap: 12px; align-items: center; }
      .footer-hint { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #444; }
      .footer-right { display: flex; align-items: center; gap: 10px; }
      #result-count { font-family: 'Geist Mono', monospace; font-size: 11px; color: #444; }
      #refresh-btn {
        background: none; border: 1px solid #333; border-radius: 5px;
        color: #555; font-size: 11px; font-family: 'Geist Mono', monospace;
        padding: 2px 8px; cursor: pointer; transition: color 0.1s, border-color 0.1s;
        display: flex; align-items: center; gap: 4px;
      }
      #refresh-btn:hover { color: #aaa; border-color: #555; }
      #refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      #status-msg { padding: 24px 16px; text-align: center; color: #555; font-size: 12px; font-family: 'Geist Mono', monospace; }
      .hint-bar {
        padding: 6px 16px; border-bottom: 1px solid #2a2a2a;
        display: flex; gap: 16px;
      }
      .hint-pill {
        font-size: 10.5px; color: #444; font-family: 'Geist Mono', monospace;
      }
      .hint-pill span { color: #5b6af0; }
    </style>
    <div id="overlay">
      <div id="palette">
        <div id="search-row">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#555" stroke-width="1.5"/>
            <path d="M10 10l3.5 3.5" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input id="search-input" placeholder="Search assignments, files, announcements..." />
          <span class="kbd">esc</span>
        </div>
        <div class="hint-bar">
          <span class="hint-pill"><span>&gt;</span> type</span>
          <span class="hint-pill"><span>#</span> course</span>
        </div>
        <div id="results"><div id="status-msg">Loading...</div></div>
        <div id="footer">
          <div class="footer-left">
            <span class="footer-hint"><span class="kbd">↑↓</span> navigate</span>
            <span class="footer-hint"><span class="kbd">↵</span> open</span>
          </div>
          <div class="footer-right">
            <span id="result-count"></span>
            <button id="refresh-btn">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M9 5A4 4 0 1 1 5 1" stroke="#555" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M5 1l1.5 1.5L5 4" stroke="#555" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function ht(t){switch(t){case"Assignment":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#4ade80" stroke-width="1.3"/><path d="M4 5h6M4 7.5h4" stroke="#4ade80" stroke-width="1.1" stroke-linecap="round"/></svg>';case"Material":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4v6L7 13 2 10V4L7 1z" stroke="#60a5fa" stroke-width="1.3"/></svg>';case"Announcement":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5h7l2-3v8l-2-3H2V5z" stroke="#c084fc" stroke-width="1.3" stroke-linejoin="round"/></svg>';case"Class":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="#fbbf24" stroke-width="1.3"/><path d="M1.5 5.5h11" stroke="#fbbf24" stroke-width="1.1"/></svg>'}}function dt(t,e){if(!e)return t;const s=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return t.replace(new RegExp(`(${s})`,"gi"),'<span class="match">$1</span>')}async function P(t){if(!m)return;const e=m.getElementById("results"),s=m.getElementById("result-count"),n=await chrome.storage.local.get("gcs-index"),i=JSON.parse(n["gcs-index"]||"[]");if(!i.length){e.innerHTML='<div id="status-msg">Fetching your classroom data...</div>',s.textContent="",W().then(()=>P(t)).catch(()=>{m&&(m.getElementById("results").innerHTML='<div id="status-msg">Failed to fetch — check your connection</div>')});return}const r=at(t),o=ut(i,r);if(H=o,t)if(o.length){const c=r.mode==="fuzzy"?r.query:"";e.innerHTML=o.map(a=>ue(a,c)).join(""),s.textContent=`${o.length} result${o.length!==1?"s":""}`}else{e.innerHTML=`<div id="status-msg">No results for "${t}"</div>`,s.textContent="0 results";return}else{const c={};i.forEach(u=>{(c[u.type]=c[u.type]||[]).push(u)}),H=i;let a="";["Assignment","Material","Announcement"].forEach(u=>{var l;(l=c[u])!=null&&l.length&&(a+=`<div class="section-label">${u}s</div>`,c[u].slice(0,4).forEach(d=>{a+=ue(d,"")}))}),e.innerHTML=a,s.textContent=`${i.length} items`}v=0,K(),ft()}function ue(t,e){return`
    <div class="result-item" data-link="${t.link}">
      <div class="item-icon icon-${t.type}">${ht(t.type)}</div>
      <div class="item-body">
        <div class="item-title">${dt(t.title,e)}</div>
        <div class="item-meta">${t.course}</div>
      </div>
      <div class="item-type">${t.type}</div>
    </div>
  `}function K(){m&&m.querySelectorAll(".result-item").forEach((t,e)=>{t.classList.toggle("active",e===v),e===v&&t.scrollIntoView({block:"nearest"})})}function ft(){m&&m.querySelectorAll(".result-item").forEach((t,e)=>{t.addEventListener("mouseenter",()=>{v=e,K()}),t.addEventListener("click",()=>{ye()})})}function ye(){if(!m)return;const e=m.querySelectorAll(".result-item")[v];if(e!=null&&e.dataset.link){const s=window.location.href.match(/\/u\/(\d+)\//),n=s?s[1]:"0",i=`${e.dataset.link}?authuser=${n}`;window.location.href=i,z()}}function Ee(){if(E)return;E=document.createElement("div"),E.id="gcs-palette-host",m=E.attachShadow({mode:"open"}),m.innerHTML=lt(),document.body.appendChild(E),m.getElementById("overlay").addEventListener("click",s=>{s.target.id==="overlay"&&z()});const t=m.getElementById("search-input");t.focus(),t.addEventListener("input",s=>{T=null,P(s.target.value.trim())});const e=m.getElementById("refresh-btn");e.addEventListener("click",async()=>{e.classList.add("spinning"),e.setAttribute("disabled","true");try{await W(),await P(t.value.trim())}finally{e.classList.remove("spinning"),e.removeAttribute("disabled")}}),m.addEventListener("keydown",s=>{const n=s;n.key==="ArrowDown"&&(n.preventDefault(),v=Math.min(v+1,H.length-1),K()),n.key==="ArrowUp"&&(n.preventDefault(),v=Math.max(v-1,0),K()),n.key==="Enter"&&ye()}),P("")}function z(){E==null||E.remove(),E=null,m=null,T=null,H=[],v=0}function pt(){if(document.getElementById("gcs-toast"))return;const e=navigator.platform.toUpperCase().includes("MAC")?"⌘K":"Ctrl+K",s=document.createElement("div");s.id="gcs-toast",s.innerHTML=`
    <style>
      #gcs-toast {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #242424;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 12px 16px;
        font-family: 'Google Sans', sans-serif;
        font-size: 13px;
        color: #ccc;
        box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        animation: gcs-slide-in 0.2s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes gcs-slide-in {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #gcs-toast.gcs-hiding {
        animation: gcs-slide-out 0.2s ease-in forwards;
      }
      @keyframes gcs-slide-out {
        to { opacity: 0; transform: translateY(-8px); }
      }
      #gcs-toast .gcs-toast-icon { opacity: 0.7; }
      #gcs-toast .gcs-toast-text { display: flex; flex-direction: column; gap: 2px; }
      #gcs-toast .gcs-toast-title { color: #e8e8e8; font-weight: 500; font-size: 13px; }
      #gcs-toast .gcs-toast-sub { color: #666; font-size: 11.5px; }
      #gcs-toast .gcs-kbd {
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        padding: 1px 6px;
        font-size: 11px;
        color: #888;
        font-family: 'Geist Mono', monospace;
      }
      #gcs-toast .gcs-dismiss {
        background: none; border: none; color: #444;
        cursor: pointer; font-size: 16px; padding: 0 0 0 4px;
        line-height: 1; transition: color 0.1s;
      }
      #gcs-toast .gcs-dismiss:hover { color: #888; }
    </style>
    <svg class="gcs-toast-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#aaa" stroke-width="1.5"/>
      <path d="M10 10l3.5 3.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <div class="gcs-toast-text">
      <span class="gcs-toast-title">Classroom Search ready</span>
      <span class="gcs-toast-sub">Press <span class="gcs-kbd">${e}</span> to search</span>
    </div>
    <button class="gcs-dismiss">×</button>
  `;const n=()=>{s.classList.add("gcs-hiding"),s.addEventListener("animationend",()=>s.remove(),{once:!0})};s.querySelector(".gcs-dismiss").addEventListener("click",n),setTimeout(n,5e3),document.body.appendChild(s)}document.addEventListener("keydown",t=>{if((navigator.platform.toUpperCase().includes("MAC")?t.metaKey:t.ctrlKey)&&t.key.toLowerCase()==="k"){t.preventDefault(),t.stopPropagation(),E?z():Ee();return}t.key==="Escape"&&E&&z()},!0);chrome.runtime.onMessage.addListener(t=>{t.type==="ACTIVATE_SEARCH"&&(E?z():Ee()),t.type==="FETCH_INDEX"&&W(),t.type==="SHOW_TOAST"&&pt()});chrome.storage.local.get("gcs-index").then(t=>{t["gcs-index"]||W()});
