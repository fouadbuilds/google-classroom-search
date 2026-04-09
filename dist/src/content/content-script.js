function k(t){return Array.isArray?Array.isArray(t):fe(t)==="[object Array]"}function Me(t){if(typeof t=="string")return t;let e=t+"";return e=="0"&&1/t==-1/0?"-0":e}function we(t){return t==null?"":Me(t)}function M(t){return typeof t=="string"}function he(t){return typeof t=="number"}function ve(t){return t===!0||t===!1||ke(t)&&fe(t)=="[object Boolean]"}function de(t){return typeof t=="object"}function ke(t){return de(t)&&t!==null}function x(t){return t!=null}function U(t){return!t.trim().length}function fe(t){return t==null?t===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(t)}const Be="Incorrect 'index' type",Fe=t=>`Invalid value for key ${t}`,De=t=>`Pattern length exceeds max of ${t}.`,Le=t=>`Missing ${t} property in key`,Ie=t=>`Property 'weight' in key '${t}' must be a positive integer`,re=Object.prototype.hasOwnProperty;class Se{constructor(e){this._keys=[],this._keyMap={};let s=0;e.forEach(n=>{let r=pe(n);this._keys.push(r),this._keyMap[r.id]=r,s+=r.weight}),this._keys.forEach(n=>{n.weight/=s})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function pe(t){let e=null,s=null,n=null,r=1,i=null;if(M(t)||k(t))n=t,e=ie(t),s=J(t);else{if(!re.call(t,"name"))throw new Error(Le("name"));const o=t.name;if(n=o,re.call(t,"weight")&&(r=t.weight,r<=0))throw new Error(Ie(o));e=ie(o),s=J(o),i=t.getFn}return{path:e,id:s,weight:r,src:n,getFn:i}}function ie(t){return k(t)?t:t.split(".")}function J(t){return k(t)?t.join("."):t}function _e(t,e){let s=[],n=!1;const r=(i,o,a)=>{if(x(i))if(!o[a])s.push(i);else{let c=o[a];const u=i[c];if(!x(u))return;if(a===o.length-1&&(M(u)||he(u)||ve(u)))s.push(we(u));else if(k(u)){n=!0;for(let l=0,d=u.length;l<d;l+=1)r(u[l],o,a+1)}else o.length&&r(u,o,a+1)}};return r(t,M(e)?e.split("."):e,0),n?s:s[0]}const $e={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Re={isCaseSensitive:!1,ignoreDiacritics:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(t,e)=>t.score===e.score?t.idx<e.idx?-1:1:t.score<e.score?-1:1},Te={location:0,threshold:.6,distance:100},Oe={useExtendedSearch:!1,getFn:_e,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var h={...Re,...$e,...Te,...Oe};const ze=/[^ ]+/g;function Ne(t=1,e=3){const s=new Map,n=Math.pow(10,e);return{get(r){const i=r.match(ze).length;if(s.has(i))return s.get(i);const o=1/Math.pow(i,.5*t),a=parseFloat(Math.round(o*n)/n);return s.set(i,a),a},clear(){s.clear()}}}class te{constructor({getFn:e=h.getFn,fieldNormWeight:s=h.fieldNormWeight}={}){this.norm=Ne(s,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((s,n)=>{this._keysMap[s.id]=n})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,M(this.docs[0])?this.docs.forEach((e,s)=>{this._addString(e,s)}):this.docs.forEach((e,s)=>{this._addObject(e,s)}),this.norm.clear())}add(e){const s=this.size();M(e)?this._addString(e,s):this._addObject(e,s)}removeAt(e){this.records.splice(e,1);for(let s=e,n=this.size();s<n;s+=1)this.records[s].i-=1}getValueForItemAtKeyId(e,s){return e[this._keysMap[s]]}size(){return this.records.length}_addString(e,s){if(!x(e)||U(e))return;let n={v:e,i:s,n:this.norm.get(e)};this.records.push(n)}_addObject(e,s){let n={i:s,$:{}};this.keys.forEach((r,i)=>{let o=r.getFn?r.getFn(e):this.getFn(e,r.path);if(x(o)){if(k(o)){let a=[];const c=[{nestedArrIndex:-1,value:o}];for(;c.length;){const{nestedArrIndex:u,value:l}=c.pop();if(x(l))if(M(l)&&!U(l)){let d={v:l,i:u,n:this.norm.get(l)};a.push(d)}else k(l)&&l.forEach((d,f)=>{c.push({nestedArrIndex:f,value:d})})}n.$[i]=a}else if(M(o)&&!U(o)){let a={v:o,n:this.norm.get(o)};n.$[i]=a}}}),this.records.push(n)}toJSON(){return{keys:this.keys,records:this.records}}}function ge(t,e,{getFn:s=h.getFn,fieldNormWeight:n=h.fieldNormWeight}={}){const r=new te({getFn:s,fieldNormWeight:n});return r.setKeys(t.map(pe)),r.setSources(e),r.create(),r}function Pe(t,{getFn:e=h.getFn,fieldNormWeight:s=h.fieldNormWeight}={}){const{keys:n,records:r}=t,i=new te({getFn:e,fieldNormWeight:s});return i.setKeys(n),i.setIndexRecords(r),i}function N(t,{errors:e=0,currentLocation:s=0,expectedLocation:n=0,distance:r=h.distance,ignoreLocation:i=h.ignoreLocation}={}){const o=e/t.length;if(i)return o;const a=Math.abs(n-s);return r?o+a/r:a?1:o}function je(t=[],e=h.minMatchCharLength){let s=[],n=-1,r=-1,i=0;for(let o=t.length;i<o;i+=1){let a=t[i];a&&n===-1?n=i:!a&&n!==-1&&(r=i-1,r-n+1>=e&&s.push([n,r]),n=-1)}return t[i-1]&&i-n>=e&&s.push([n,i-1]),s}const _=32;function Ge(t,e,s,{location:n=h.location,distance:r=h.distance,threshold:i=h.threshold,findAllMatches:o=h.findAllMatches,minMatchCharLength:a=h.minMatchCharLength,includeMatches:c=h.includeMatches,ignoreLocation:u=h.ignoreLocation}={}){if(e.length>_)throw new Error(De(_));const l=e.length,d=t.length,f=Math.max(0,Math.min(n,d));let p=i,g=f;const A=a>1||c,C=A?Array(d):[];let B;for(;(B=t.indexOf(e,g))>-1;){let y=N(e,{currentLocation:B,expectedLocation:f,distance:r,ignoreLocation:u});if(p=Math.min(y,p),g=B+l,A){let F=0;for(;F<l;)C[B+F]=1,F+=1}}g=-1;let v=[],$=1,S=l+d;const be=1<<l-1;for(let y=0;y<l;y+=1){let F=0,D=S;for(;F<D;)N(e,{errors:y,currentLocation:f+D,expectedLocation:f,distance:r,ignoreLocation:u})<=p?F=D:S=D,D=Math.floor((S-F)/2+F);S=D;let se=Math.max(1,f-D+1),V=o?d:Math.min(f+D,d)+l,R=Array(V+2);R[V+1]=(1<<y)-1;for(let b=V;b>=se;b-=1){let z=b-1,ne=s[t.charAt(z)];if(A&&(C[z]=+!!ne),R[b]=(R[b+1]<<1|1)&ne,y&&(R[b]|=(v[b+1]|v[b])<<1|1|v[b+1]),R[b]&be&&($=N(e,{errors:y,currentLocation:z,expectedLocation:f,distance:r,ignoreLocation:u}),$<=p)){if(p=$,g=z,g<=f)break;se=Math.max(1,2*f-g)}}if(N(e,{errors:y+1,currentLocation:f,expectedLocation:f,distance:r,ignoreLocation:u})>p)break;v=R}const Y={isMatch:g>=0,score:Math.max(.001,$)};if(A){const y=je(C,a);y.length?c&&(Y.indices=y):Y.isMatch=!1}return Y}function He(t){let e={};for(let s=0,n=t.length;s<n;s+=1){const r=t.charAt(s);e[r]=(e[r]||0)|1<<n-s-1}return e}const j=String.prototype.normalize?t=>t.normalize("NFD").replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g,""):t=>t;class me{constructor(e,{location:s=h.location,threshold:n=h.threshold,distance:r=h.distance,includeMatches:i=h.includeMatches,findAllMatches:o=h.findAllMatches,minMatchCharLength:a=h.minMatchCharLength,isCaseSensitive:c=h.isCaseSensitive,ignoreDiacritics:u=h.ignoreDiacritics,ignoreLocation:l=h.ignoreLocation}={}){if(this.options={location:s,threshold:n,distance:r,includeMatches:i,findAllMatches:o,minMatchCharLength:a,isCaseSensitive:c,ignoreDiacritics:u,ignoreLocation:l},e=c?e:e.toLowerCase(),e=u?j(e):e,this.pattern=e,this.chunks=[],!this.pattern.length)return;const d=(p,g)=>{this.chunks.push({pattern:p,alphabet:He(p),startIndex:g})},f=this.pattern.length;if(f>_){let p=0;const g=f%_,A=f-g;for(;p<A;)d(this.pattern.substr(p,_),p),p+=_;if(g){const C=f-_;d(this.pattern.substr(C),C)}}else d(this.pattern,0)}searchIn(e){const{isCaseSensitive:s,ignoreDiacritics:n,includeMatches:r}=this.options;if(e=s?e:e.toLowerCase(),e=n?j(e):e,this.pattern===e){let A={isMatch:!0,score:0};return r&&(A.indices=[[0,e.length-1]]),A}const{location:i,distance:o,threshold:a,findAllMatches:c,minMatchCharLength:u,ignoreLocation:l}=this.options;let d=[],f=0,p=!1;this.chunks.forEach(({pattern:A,alphabet:C,startIndex:B})=>{const{isMatch:v,score:$,indices:S}=Ge(e,A,C,{location:i+B,distance:o,threshold:a,findAllMatches:c,minMatchCharLength:u,includeMatches:r,ignoreLocation:l});v&&(p=!0),f+=$,v&&S&&(d=[...d,...S])});let g={isMatch:p,score:p?f/this.chunks.length:1};return p&&r&&(g.indices=d),g}}class I{constructor(e){this.pattern=e}static isMultiMatch(e){return oe(e,this.multiRegex)}static isSingleMatch(e){return oe(e,this.singleRegex)}search(){}}function oe(t,e){const s=t.match(e);return s?s[1]:null}class Ke extends I{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const s=e===this.pattern;return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class We extends I{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const n=e.indexOf(this.pattern)===-1;return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}}class Ye extends I{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const s=e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Ve extends I{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const s=!e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class Ue extends I{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const s=e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class Je extends I{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const s=!e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class Ae extends I{constructor(e,{location:s=h.location,threshold:n=h.threshold,distance:r=h.distance,includeMatches:i=h.includeMatches,findAllMatches:o=h.findAllMatches,minMatchCharLength:a=h.minMatchCharLength,isCaseSensitive:c=h.isCaseSensitive,ignoreDiacritics:u=h.ignoreDiacritics,ignoreLocation:l=h.ignoreLocation}={}){super(e),this._bitapSearch=new me(e,{location:s,threshold:n,distance:r,includeMatches:i,findAllMatches:o,minMatchCharLength:a,isCaseSensitive:c,ignoreDiacritics:u,ignoreLocation:l})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class xe extends I{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let s=0,n;const r=[],i=this.pattern.length;for(;(n=e.indexOf(this.pattern,s))>-1;)s=n+i,r.push([n,s-1]);const o=!!r.length;return{isMatch:o,score:o?0:1,indices:r}}}const Q=[Ke,xe,Ye,Ve,Je,Ue,We,Ae],ce=Q.length,Qe=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,Xe="|";function qe(t,e={}){return t.split(Xe).map(s=>{let n=s.trim().split(Qe).filter(i=>i&&!!i.trim()),r=[];for(let i=0,o=n.length;i<o;i+=1){const a=n[i];let c=!1,u=-1;for(;!c&&++u<ce;){const l=Q[u];let d=l.isMultiMatch(a);d&&(r.push(new l(d,e)),c=!0)}if(!c)for(u=-1;++u<ce;){const l=Q[u];let d=l.isSingleMatch(a);if(d){r.push(new l(d,e));break}}}return r})}const Ze=new Set([Ae.type,xe.type]);class et{constructor(e,{isCaseSensitive:s=h.isCaseSensitive,ignoreDiacritics:n=h.ignoreDiacritics,includeMatches:r=h.includeMatches,minMatchCharLength:i=h.minMatchCharLength,ignoreLocation:o=h.ignoreLocation,findAllMatches:a=h.findAllMatches,location:c=h.location,threshold:u=h.threshold,distance:l=h.distance}={}){this.query=null,this.options={isCaseSensitive:s,ignoreDiacritics:n,includeMatches:r,minMatchCharLength:i,findAllMatches:a,ignoreLocation:o,location:c,threshold:u,distance:l},e=s?e:e.toLowerCase(),e=n?j(e):e,this.pattern=e,this.query=qe(this.pattern,this.options)}static condition(e,s){return s.useExtendedSearch}searchIn(e){const s=this.query;if(!s)return{isMatch:!1,score:1};const{includeMatches:n,isCaseSensitive:r,ignoreDiacritics:i}=this.options;e=r?e:e.toLowerCase(),e=i?j(e):e;let o=0,a=[],c=0;for(let u=0,l=s.length;u<l;u+=1){const d=s[u];a.length=0,o=0;for(let f=0,p=d.length;f<p;f+=1){const g=d[f],{isMatch:A,indices:C,score:B}=g.search(e);if(A){if(o+=1,c+=B,n){const v=g.constructor.type;Ze.has(v)?a=[...a,...C]:a.push(C)}}else{c=0,o=0,a.length=0;break}}if(o){let f={isMatch:!0,score:c/o};return n&&(f.indices=a),f}}return{isMatch:!1,score:1}}}const X=[];function tt(...t){X.push(...t)}function q(t,e){for(let s=0,n=X.length;s<n;s+=1){let r=X[s];if(r.condition(t,e))return new r(t,e)}return new me(t,e)}const G={AND:"$and",OR:"$or"},Z={PATH:"$path",PATTERN:"$val"},ee=t=>!!(t[G.AND]||t[G.OR]),st=t=>!!t[Z.PATH],nt=t=>!k(t)&&de(t)&&!ee(t),ae=t=>({[G.AND]:Object.keys(t).map(e=>({[e]:t[e]}))});function ye(t,e,{auto:s=!0}={}){const n=r=>{let i=Object.keys(r);const o=st(r);if(!o&&i.length>1&&!ee(r))return n(ae(r));if(nt(r)){const c=o?r[Z.PATH]:i[0],u=o?r[Z.PATTERN]:r[c];if(!M(u))throw new Error(Fe(c));const l={keyId:J(c),pattern:u};return s&&(l.searcher=q(u,e)),l}let a={children:[],operator:i[0]};return i.forEach(c=>{const u=r[c];k(u)&&u.forEach(l=>{a.children.push(n(l))})}),a};return ee(t)||(t=ae(t)),n(t)}function rt(t,{ignoreFieldNorm:e=h.ignoreFieldNorm}){t.forEach(s=>{let n=1;s.matches.forEach(({key:r,norm:i,score:o})=>{const a=r?r.weight:null;n*=Math.pow(o===0&&a?Number.EPSILON:o,(a||1)*(e?1:i))}),s.score=n})}function it(t,e){const s=t.matches;e.matches=[],x(s)&&s.forEach(n=>{if(!x(n.indices)||!n.indices.length)return;const{indices:r,value:i}=n;let o={indices:r,value:i};n.key&&(o.key=n.key.src),n.idx>-1&&(o.refIndex=n.idx),e.matches.push(o)})}function ot(t,e){e.score=t.score}function ct(t,e,{includeMatches:s=h.includeMatches,includeScore:n=h.includeScore}={}){const r=[];return s&&r.push(it),n&&r.push(ot),t.map(i=>{const{idx:o}=i,a={item:e[o],refIndex:o};return r.length&&r.forEach(c=>{c(i,a)}),a})}class L{constructor(e,s={},n){this.options={...h,...s},this.options.useExtendedSearch,this._keyStore=new Se(this.options.keys),this.setCollection(e,n)}setCollection(e,s){if(this._docs=e,s&&!(s instanceof te))throw new Error(Be);this._myIndex=s||ge(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){x(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const s=[];for(let n=0,r=this._docs.length;n<r;n+=1){const i=this._docs[n];e(i,n)&&(this.removeAt(n),n-=1,r-=1,s.push(i))}return s}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:s=-1}={}){const{includeMatches:n,includeScore:r,shouldSort:i,sortFn:o,ignoreFieldNorm:a}=this.options;let c=M(e)?M(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return rt(c,{ignoreFieldNorm:a}),i&&c.sort(o),he(s)&&s>-1&&(c=c.slice(0,s)),ct(c,this._docs,{includeMatches:n,includeScore:r})}_searchStringList(e){const s=q(e,this.options),{records:n}=this._myIndex,r=[];return n.forEach(({v:i,i:o,n:a})=>{if(!x(i))return;const{isMatch:c,score:u,indices:l}=s.searchIn(i);c&&r.push({item:i,idx:o,matches:[{score:u,value:i,norm:a,indices:l}]})}),r}_searchLogical(e){const s=ye(e,this.options),n=(a,c,u)=>{if(!a.children){const{keyId:d,searcher:f}=a,p=this._findMatches({key:this._keyStore.get(d),value:this._myIndex.getValueForItemAtKeyId(c,d),searcher:f});return p&&p.length?[{idx:u,item:c,matches:p}]:[]}const l=[];for(let d=0,f=a.children.length;d<f;d+=1){const p=a.children[d],g=n(p,c,u);if(g.length)l.push(...g);else if(a.operator===G.AND)return[]}return l},r=this._myIndex.records,i={},o=[];return r.forEach(({$:a,i:c})=>{if(x(a)){let u=n(s,a,c);u.length&&(i[c]||(i[c]={idx:c,item:a,matches:[]},o.push(i[c])),u.forEach(({matches:l})=>{i[c].matches.push(...l)}))}}),o}_searchObjectList(e){const s=q(e,this.options),{keys:n,records:r}=this._myIndex,i=[];return r.forEach(({$:o,i:a})=>{if(!x(o))return;let c=[];n.forEach((u,l)=>{c.push(...this._findMatches({key:u,value:o[l],searcher:s}))}),c.length&&i.push({idx:a,item:o,matches:c})}),i}_findMatches({key:e,value:s,searcher:n}){if(!x(s))return[];let r=[];if(k(s))s.forEach(({v:i,i:o,n:a})=>{if(!x(i))return;const{isMatch:c,score:u,indices:l}=n.searchIn(i);c&&r.push({score:u,key:e,value:i,idx:o,norm:a,indices:l})});else{const{v:i,n:o}=s,{isMatch:a,score:c,indices:u}=n.searchIn(i);a&&r.push({score:c,key:e,value:i,norm:o,indices:u})}return r}}L.version="7.1.0";L.createIndex=ge;L.parseIndex=Pe;L.config=h;L.parseQuery=ye;tt(et);const at="your-appscript-deployment-url";function ut(t,e){const s=t.postedAt??0,n=e.postedAt??0;return n!==s?n-s:t.title<e.title?-1:t.title>e.title?1:0}function ue(t){return[...t].sort(ut)}let E=null,m=null,T=null,w=0,H=[];async function W(){try{const t=await fetch(at,{redirect:"follow"});if(!t.ok)throw new Error(`HTTP ${t.status}`);const e=await t.json(),s=Array.isArray(e)?e:e.items,n=Array.isArray(e)?"":e.email||"";if(!Array.isArray(s))throw new Error("Not an array");await chrome.storage.local.set({"gcs-index":JSON.stringify(s),"gcs-email":n,"gcs-last-updated":Date.now()}),T=null,console.log(`[GCS] Index stored — ${s.length} items`)}catch(t){throw console.error("[GCS] fetch failed",t),t}}function lt(t){if(t.startsWith(">")){const s=t.slice(1).trim().split(" "),n=s[0]||"",r=s.slice(1).join(" ").trim();return{mode:"type",filter:n.toLowerCase(),subquery:r}}if(t.startsWith("#")){const e=t.slice(1).trim(),s=e.search(/\s/),n=s===-1?e:e.slice(0,s),r=s===-1?"":e.slice(s+1).trim();return{mode:"course",filter:n.toLowerCase(),subquery:r}}return{mode:"fuzzy",query:t}}function ht(t,e){if(e.mode==="type"){const n={assignment:"Assignment",assignments:"Assignment",material:"Material",materials:"Material",announcement:"Announcement",announcements:"Announcement"}[e.filter]||e.filter;let r=t.filter(i=>i.type.toLowerCase().includes(n.toLowerCase()));return e.subquery&&(r=new L(r,{keys:["title","course"],threshold:.35}).search(e.subquery).map(o=>o.item)),r}if(e.mode==="course"){const s=e.filter.replace(/\s+/g,"").toLowerCase();let n=t.filter(r=>r.course.replace(/\s+/g,"").toLowerCase().includes(s));return e.subquery&&(n=new L(n,{keys:["title","type"],threshold:.35}).search(e.subquery).map(i=>i.item)),n}return e.query?(T||(T=new L(t,{keys:["title","course","type"],threshold:.35,includeScore:!0,minMatchCharLength:1})),T.search(e.query).map(s=>s.item)):t}function dt(){return`
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
  `}function ft(t){switch(t){case"Assignment":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#4ade80" stroke-width="1.3"/><path d="M4 5h6M4 7.5h4" stroke="#4ade80" stroke-width="1.1" stroke-linecap="round"/></svg>';case"Material":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4v6L7 13 2 10V4L7 1z" stroke="#60a5fa" stroke-width="1.3"/></svg>';case"Announcement":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5h7l2-3v8l-2-3H2V5z" stroke="#c084fc" stroke-width="1.3" stroke-linejoin="round"/></svg>';case"Class":return'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="#fbbf24" stroke-width="1.3"/><path d="M1.5 5.5h11" stroke="#fbbf24" stroke-width="1.1"/></svg>'}}function pt(t,e){if(!e)return t;const s=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return t.replace(new RegExp(`(${s})`,"gi"),'<span class="match">$1</span>')}async function P(t){if(!m)return;const e=m.getElementById("results"),s=m.getElementById("result-count"),n=await chrome.storage.local.get("gcs-index"),i=JSON.parse(n["gcs-index"]||"[]").map(c=>({...c,postedAt:typeof c.postedAt=="number"?c.postedAt:0}));if(!i.length){e.innerHTML='<div id="status-msg">Fetching your classroom data...</div>',s.textContent="",W().then(()=>P(t)).catch(()=>{m&&(m.getElementById("results").innerHTML='<div id="status-msg">Failed to fetch — check your connection</div>')});return}const o=lt(t),a=ht(i,o);if(t)if(a.length){const c=o.mode==="fuzzy"?o.query:"",u=ue(a);H=u,e.innerHTML=u.map(l=>le(l,c)).join(""),s.textContent=`${u.length} result${u.length!==1?"s":""}`}else{e.innerHTML=`<div id="status-msg">No results for "${t}"</div>`,s.textContent="0 results";return}else{const c={};i.forEach(l=>{(c[l.type]=c[l.type]||[]).push(l)}),Object.keys(c).forEach(l=>{c[l]=ue(c[l])}),H=i;let u="";["Assignment","Material","Announcement"].forEach(l=>{var d;(d=c[l])!=null&&d.length&&(u+=`<div class="section-label">${l}s</div>`,c[l].slice(0,4).forEach(f=>{u+=le(f,"")}))}),e.innerHTML=u,s.textContent=`${i.length} items`}w=0,K(),gt()}function le(t,e){return`
    <div class="result-item" data-link="${t.link}">
      <div class="item-icon icon-${t.type}">${ft(t.type)}</div>
      <div class="item-body">
        <div class="item-title">${pt(t.title,e)}</div>
        <div class="item-meta">${t.course}</div>
      </div>
      <div class="item-type">${t.type}</div>
    </div>
  `}function K(){m&&m.querySelectorAll(".result-item").forEach((t,e)=>{t.classList.toggle("active",e===w),e===w&&t.scrollIntoView({block:"nearest"})})}function gt(){m&&m.querySelectorAll(".result-item").forEach((t,e)=>{t.addEventListener("mouseenter",()=>{w=e,K()}),t.addEventListener("click",()=>{Ee()})})}function Ee(){if(!m)return;const e=m.querySelectorAll(".result-item")[w];if(e!=null&&e.dataset.link){const s=window.location.href.match(/\/u\/(\d+)\//),n=s?s[1]:"0",r=`${e.dataset.link}?authuser=${n}`;window.location.href=r,O()}}function Ce(){if(E)return;E=document.createElement("div"),E.id="gcs-palette-host",m=E.attachShadow({mode:"open"}),m.innerHTML=dt(),document.body.appendChild(E),m.getElementById("overlay").addEventListener("click",s=>{s.target.id==="overlay"&&O()});const t=m.getElementById("search-input");t.focus(),t.addEventListener("input",s=>{T=null,P(s.target.value.trim())});const e=m.getElementById("refresh-btn");e.addEventListener("click",async()=>{e.classList.add("spinning"),e.setAttribute("disabled","true");try{await W(),await P(t.value.trim())}finally{e.classList.remove("spinning"),e.removeAttribute("disabled")}}),m.addEventListener("keydown",s=>{const n=s;n.key==="ArrowDown"&&(n.preventDefault(),w=Math.min(w+1,H.length-1),K()),n.key==="ArrowUp"&&(n.preventDefault(),w=Math.max(w-1,0),K()),n.key==="Enter"&&Ee()}),P("")}function O(){E==null||E.remove(),E=null,m=null,T=null,H=[],w=0}function mt(){if(document.getElementById("gcs-toast"))return;const e=navigator.platform.toUpperCase().includes("MAC")?"⌘K":"Ctrl+K",s=document.createElement("div");s.id="gcs-toast",s.innerHTML=`
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
  `;const n=()=>{s.classList.add("gcs-hiding"),s.addEventListener("animationend",()=>s.remove(),{once:!0})};s.querySelector(".gcs-dismiss").addEventListener("click",n),setTimeout(n,5e3),document.body.appendChild(s)}document.addEventListener("keydown",t=>{if((navigator.platform.toUpperCase().includes("MAC")?t.metaKey:t.ctrlKey)&&t.key.toLowerCase()==="k"){t.preventDefault(),t.stopPropagation(),E?O():Ce();return}t.key==="Escape"&&E&&O()},!0);chrome.runtime.onMessage.addListener(t=>{t.type==="ACTIVATE_SEARCH"&&(E?O():Ce()),t.type==="FETCH_INDEX"&&W(),t.type==="SHOW_TOAST"&&mt()});chrome.storage.local.get("gcs-index").then(t=>{t["gcs-index"]||W()});
