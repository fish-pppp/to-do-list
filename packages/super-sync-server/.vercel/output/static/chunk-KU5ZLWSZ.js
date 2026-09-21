import{b as We,c as Ye,g as zi}from"./chunk-T5X7M7SV.js";import{T as Ze,U as Ui,x as Je,y as Ni}from"./chunk-2D5KRGZ7.js";import{g as Xe,h as Bi}from"./chunk-6ALKREYM.js";import{a as Q,b as kt,c as Qe,d as Gt,p as Pi}from"./chunk-JOGRKAEZ.js";import{A as Pe,U as bt,V as Be,Xa as D,Ya as Vt,z as ft}from"./chunk-HLLYJGCQ.js";import{b as $e,c as Ri}from"./chunk-LDZBAP7L.js";import{a as He,b as Ti,c as qe,d as Fi}from"./chunk-WK7OQWG3.js";import{a as A,d as Nt}from"./chunk-IARC2QOO.js";import{V as ut,W as Te,X as Re,Y as Ci,a as Bt,b as _i,g as Oe,o as bi}from"./chunk-567PY3RQ.js";import{F as Ke,O as Mi,y as Ge}from"./chunk-5JRS3H2I.js";import{$a as wi,E as Ee,I as Ae,Ia as ki,Jb as Ve,Ka as Le,Lb as Di,Ma as yi,Ta as P,Va as xi,Yb as z,Zb as jt,_a as De,d as pt,g as xe,hb as Ei,mb as vt,ob as ze,qb as Ne,r as we,rb as Ue,tb as Ai,u as gi,ub as je,vb as Li,w as Se,x as fi,y as Ce}from"./chunk-7235EZRS.js";import{j as Me,k as Si,l as Oi}from"./chunk-2N33RMRJ.js";import{a as u,b as zt}from"./chunk-DLH4G22M.js";import{a as Ie,d as vi}from"./chunk-W2C4DBEJ.js";import{a as Rt,b as pi,c as B,e as Fe}from"./chunk-NK2HSCN2.js";import{a as E,c as ye,q as ht}from"./chunk-MW5MF2YD.js";import{a as gt,b as Ii}from"./chunk-YNJSQG7S.js";import{c as ke,d as ui}from"./chunk-C4N4CKT3.js";import{a as b,g as Pt,h as $}from"./chunk-7DBDLXYW.js";import{$c as R,Ca as Ct,Cb as pe,D as ae,Dc as Dt,E as re,Ea as m,Ec as q,F as et,Fc as st,Gc as ct,Hb as Et,K as oe,Od as ve,P as it,Pa as me,Ra as de,Tc as ue,Ua as he,Ud as dt,Vc as lt,W as se,Wc as Mt,X as ce,Xc as T,Ya as V,Yb as K,Yc as Tt,Zc as _e,_b as L,_c as F,a as ee,bb as at,bc as H,ed as Ft,fb as G,fd as mt,hb as rt,id as ge,ie as S,jd as fe,l as j,ma as nt,n as ie,pa as le,s as Z,t as ne,ta as It,u as tt,uc as ot,wc as At,xd as be,yc as Lt,za as C}from"./chunk-BYZBW3B6.js";import{a as _t,b as Ut}from"./chunk-UZGBAYMW.js";import{a as g,b as w,c as te,d as J,e as I,j as f}from"./chunk-PE6UJDCZ.js";function ji(i){if(!isFinite(i))return 0;let s=1,t=0;for(;Math.round(i*s)/s!==i;)s*=10,t++;return t}function O(i){return i===""||i==null}function X(i){return i!=null&&typeof i=="object"&&!Array.isArray(i)}function Vi(i){return Number.isInteger?Number.isInteger(i):typeof i=="number"&&Math.floor(i)===i}function Kt(i){return typeof i=="object"&&(i.hasOwnProperty("const")||i.enum&&i.enum.length===1)}function Gi(i){if(i===""||i===void 0)return;if(i===null)return null;if(typeof i=="number")return i;let s=parseFloat(i);return isNaN(s)?i:s}function yt(i){if(!i.fieldGroup)return Q(i)&&kt(i)!==void 0?1:0;let s=i.fieldGroup.reduce((t,e)=>yt(e)+t,0);if(s===0&&Q(i)){let t=kt(i);if(t===null||t!==void 0&&(i.fieldArray&&Array.isArray(t)||!i.fieldArray&&X(t)))return 1}return s}var Bn,Ki=I(()=>{"use strict";S();Mi();Pi();at();Bn=(()=>{class i{toFieldConfig(t,e){return t=Gt(t),this._toFieldConfig(t,g({schema:t},e||{}))}_toFieldConfig(t,c){var h=c,{key:e,isOptional:n}=h,a=J(h,["key","isOptional"]);t=this.resolveSchema(t,a);let d=this.guessSchemaType(t),r={type:d[0],defaultValue:t.default,props:{label:t.title,readonly:t.readOnly,description:t.description}};if(e!=null&&(r.key=e),!a.ignoreDefault&&(t.readOnly||a.readOnly)&&(r.props.disabled=!0,a=w(g({},a),{readOnly:!0})),a.resetOnHide&&(r.resetOnHide=!0),a.shareFormControl===!1&&(r.shareFormControl=!1),r.defaultValue===void 0&&d.length===1&&n===!1)switch(d[0]){case"null":{r.defaultValue=null;break}case"string":{r.defaultValue="";break}case"object":{r.defaultValue={};break}case"array":{r.defaultValue=t.minItems>0?Array.from(new Array(t.minItems)):[];break}}switch(a.ignoreDefault&&delete r.defaultValue,this.addValidator(r,"type",{schemaType:d,expression:({value:o})=>{if(o===void 0||o===null&&d.indexOf("null")!==-1)return!0;switch(d[0]){case"null":return typeof o===null;case"string":return typeof o=="string";case"integer":return Vi(o);case"number":return typeof o=="number";case"object":return X(o);case"array":return Array.isArray(o)}return!0}}),r.type){case"number":case"integer":{r.parsers=[(o,p)=>{if(o=Gi(o),o===null&&p){let l=typeof document<"u"&&p.id?document.querySelector(`#${p.id}`):void 0;l&&l.validity&&!l.validity.badInput&&(o=void 0),o!==p.formControl.value&&p.formControl.setValue(o,{emitModelToViewChange:!1})}return o}],t.hasOwnProperty("minimum")&&(r.props.min=t.minimum),t.hasOwnProperty("maximum")&&(r.props.max=t.maximum),t.hasOwnProperty("exclusiveMinimum")&&(r.props.exclusiveMinimum=t.exclusiveMinimum,this.addValidator(r,"exclusiveMinimum",({value:o})=>O(o)||o>t.exclusiveMinimum)),t.hasOwnProperty("exclusiveMaximum")&&(r.props.exclusiveMaximum=t.exclusiveMaximum,this.addValidator(r,"exclusiveMaximum",({value:o})=>O(o)||o<t.exclusiveMaximum)),t.hasOwnProperty("multipleOf")&&(r.props.step=t.multipleOf,this.addValidator(r,"multipleOf",({value:o})=>{if(O(o)||typeof o!="number"||o===0||t.multipleOf<=0)return!0;let p=Math.pow(10,ji(t.multipleOf));return Math.round(o*p)%Math.round(t.multipleOf*p)===0}));break}case"string":{r.parsers=[(o,p)=>(d.indexOf("null")!==-1?o=O(o)?null:o:p&&!p.props.required&&(o=o===""?void 0:o),o)],["minLength","maxLength","pattern"].forEach(o=>{t.hasOwnProperty(o)&&(r.props[o]=t[o])});break}case"object":{r.fieldGroup||(r.fieldGroup=[]);let{propDeps:o,schemaDeps:p}=this.resolveDependencies(t);Object.keys(t.properties||{}).forEach(l=>{let v=Array.isArray(t.required)&&t.required.indexOf(l)!==-1,k=this._toFieldConfig(t.properties[l],w(g({},a),{key:l,isOptional:n||!v}));if(r.fieldGroup.push(k),(v||o[l])&&(k.expressions=w(g({},k.expressions||{}),{"props.required":y=>{let _=y.parent,x=y.fieldGroup&&y.key!=null?_.model:y.model;for(;_.key==null&&_.parent;)_=_.parent;let M=_&&_.props?_.props.required:!1;return!x&&!M?!1:Array.isArray(t.required)&&t.required.indexOf(l)!==-1?!0:o[l]&&y.model&&o[l].some(U=>!O(y.model[U]))}})),p[l]){let y=x=>x.hasOwnProperty("const")?x.const:x.enum[0],_=p[l].oneOf;_&&_.every(x=>x.properties&&x.properties[l]&&Kt(x.properties[l]))?_.forEach(x=>{let Jt=x.properties,{[l]:M}=Jt,U=J(Jt,[te(l)]);r.fieldGroup.push(w(g({},this._toFieldConfig(w(g({},x),{properties:U}),w(g({},a),{shareFormControl:!1,resetOnHide:!0}))),{expressions:{hide:Zt=>!Zt.model||y(M)!==Zt.model[l]}}))}):r.fieldGroup.push(w(g({},this._toFieldConfig(p[l],a)),{expressions:{hide:x=>!x.model||O(x.model[l])}}))}}),t.oneOf&&r.fieldGroup.push(this.resolveMultiSchema("oneOf",t.oneOf,w(g({},a),{shareFormControl:!1}))),t.anyOf&&r.fieldGroup.push(this.resolveMultiSchema("anyOf",t.anyOf,a)),a.conditionalSchemas&&a.conditionalSchemas.forEach(v=>{let k=v._ifCondition;if(k&&v.properties){let y={fieldGroup:[],expressions:{hide:_=>{if(!_.model)return!0;let M=_.model[k.property]===k.value;return k.negate?M:!M}}};Object.keys(v.properties).forEach(_=>{let x=v.properties[_];if(!x)return;let M=Array.isArray(v.required)&&v.required.indexOf(_)!==-1,U=this._toFieldConfig(x,w(g({},a),{key:_,isOptional:!M,resetOnHide:!0}));y.fieldGroup.push(U)}),r.fieldGroup.push(y)}});break}case"array":{t.hasOwnProperty("minItems")&&(r.props.minItems=t.minItems,this.addValidator(r,"minItems",({value:o})=>O(o)||o.length>=t.minItems),!n&&t.minItems>0&&r.defaultValue===void 0&&(r.defaultValue=Array.from(new Array(t.minItems)))),t.hasOwnProperty("maxItems")&&(r.props.maxItems=t.maxItems,this.addValidator(r,"maxItems",({value:o})=>O(o)||o.length<=t.maxItems)),t.hasOwnProperty("uniqueItems")&&(r.props.uniqueItems=t.uniqueItems,this.addValidator(r,"uniqueItems",({value:o})=>O(o)||!t.uniqueItems?!0:Array.from(new Set(o.map(l=>JSON.stringify(l,(v,k)=>X(k)?Object.keys(k).sort().reduce((y,_)=>(y[_]=k[_],y),{}):k)))).length===o.length)),t.items&&!Array.isArray(t.items)&&(t.items=this.resolveSchema(t.items,a)),this.isEnum(t)||(r.fieldArray=o=>{let p=o.fieldGroup?o.fieldGroup.length:0,l=t.items;if(!Array.isArray(l)){if(!l)return{};let y=l.oneOf||l.anyOf,_=this._toFieldConfig(l,y?w(g({},a),{key:`${p}`,isOptional:!1}):w(g({},a),{isOptional:!1}));return y&&!Q(_)&&(_.key=null),_}let v=l[p]?l[p]:t.additionalItems,k=v?this._toFieldConfig(v,a):{};return k.props&&(k.props.required=!0),l[p]&&(k.props.removable=!1),k});break}}if(t.hasOwnProperty("const")&&(r.props.const=t.const,this.addValidator(r,"const",({value:o})=>o===t.const),r.type||(r.defaultValue=t.const)),this.isEnum(t)){let o=this.toEnumOptions(t),p=r.type==="array";r.type="enum",r.props.multiple=p,r.props.options=o;let l=o.map(v=>v.value);this.addValidator(r,"enum",({value:v})=>v===void 0?!0:p?Array.isArray(v)?v.every(k=>l.includes(k)):!1:l.includes(v))}return t.oneOf&&!r.type&&(delete r.key,r.fieldGroup=[this.resolveMultiSchema("oneOf",t.oneOf,w(g({},a),{key:e,shareFormControl:!1}))]),t.anyOf&&!r.type&&(delete r.key,r.fieldGroup=[this.resolveMultiSchema("oneOf",t.anyOf,w(g({},a),{key:e,shareFormControl:!1}))]),t.widget?.formlyConfig&&(r=this.mergeFields(r,t.widget.formlyConfig)),r.templateOptions=r.props,a.map?a.map(r,t):r}resolveSchema(t,e){if(t&&t.$ref&&(t=this.resolveDefinition(t,e)),t&&t.allOf&&(t=this.resolveAllOf(t,e)),t&&(t.if||t.then||t.else)){let n=this.resolveIfThenElse(t,e);n.length>0&&(e.conditionalSchemas=n)}return t}resolveAllOf(a,n){var c=a,{allOf:t}=c,e=J(c,["allOf"]);if(!t.length)throw Error(`allOf array can not be empty ${t}.`);return t.reduce((h,d)=>(d=this.resolveSchema(d,n),h.required&&d.required&&(h.required=[...h.required,...d.required]),d.uniqueItems&&(h.uniqueItems=d.uniqueItems),["maxLength","maximum","exclusiveMaximum","maxItems","maxProperties"].forEach(r=>{!O(h[r])&&!O(d[r])&&(h[r]=h[r]<d[r]?h[r]:d[r])}),["minLength","minimum","exclusiveMinimum","minItems","minProperties"].forEach(r=>{!O(h[r])&&!O(d[r])&&(h[r]=h[r]>d[r]?h[r]:d[r])}),Qe(h,d)),e)}resolveMultiSchema(t,e,n){return{type:"multischema",fieldGroup:[{type:"enum",defaultValue:-1,props:{multiple:t==="anyOf",options:e.map((a,c)=>({label:a.title,value:c,disabled:a.readOnly}))},hooks:{onInit:a=>a.formControl.valueChanges.pipe(le(()=>a.options.detectChanges(a.parent)))}},{fieldGroup:e.map((a,c)=>w(g({},this._toFieldConfig(a,w(g({},n),{resetOnHide:!0}))),{expressions:{hide:(h,d)=>{let r=h.parent.parent.fieldGroup[0].formControl;if(r.value===-1||d){let o=h.parent.fieldGroup.map((p,l)=>[p,l,this.isFieldValid(p,l,e,n)]).sort(([p,,l],[v,,k])=>{if(l!==k)return k?1:-1;let y=yt(p),_=yt(v);return y===_&&p.props.disabled===v.props.disabled?0:_>y?1:-1}).map(([,p])=>p);if(t==="anyOf"){let p=o.filter(l=>yt(h.parent.fieldGroup[l]));o=p.length>0?p:[o[0]||0]}o=o.length>0?o:[0],r.setValue(t==="anyOf"?o:o[0])}return Array.isArray(r.value)?r.value.indexOf(c)===-1:r.value!==c}}}))}]}}resolveDefinition(t,e){let[n,a]=t.$ref.split("#/");if(n)throw Error(`Remote schemas for ${t.$ref} not supported yet.`);let c=a?a.split("/").reduce((h,d)=>h?.hasOwnProperty(d)?h[d]:null,e.schema):null;if(!c)throw Error(`Cannot find a definition for ${t.$ref}.`);return c.$ref?this.resolveDefinition(c,e):g(g({},c),["title","description","default","widget"].reduce((h,d)=>(t.hasOwnProperty(d)&&(h[d]=t[d]),h),{}))}resolveDependencies(t){let e={},n={};return Object.keys(t.dependencies||{}).forEach(a=>{let c=t.dependencies[a];Array.isArray(c)?c.forEach(h=>{e[h]?e[h].push(a):e[h]=[a]}):n[a]=c}),{propDeps:e,schemaDeps:n}}extractIfCondition(t){if(t.properties){let e=Object.keys(t.properties)[0];if(e){let n=t.properties[e];if(n&&n.hasOwnProperty("const"))return{property:e,value:n.const}}}return null}resolveIfThenElse(t,e){let n=[];if(t.if&&typeof t.if=="object"){let a=this.extractIfCondition(t.if);if(a){if(t.then&&typeof t.then=="object"){let c=this.resolveConditionalSchema(t.then,e);n.push(w(g({},c),{_ifCondition:a}))}if(t.else&&typeof t.else=="object"){let c=this.resolveConditionalSchema(t.else,e);n.push(w(g({},c),{_ifCondition:{property:a.property,value:a.value,negate:!0}}))}}}return n}resolveConditionalSchema(t,e){let n=t;return t.$ref&&(n=this.resolveDefinition(t,e)),n.allOf&&(n=this.resolveAllOf(n,e)),n}guessSchemaType(t){let e=t?.type;return!e&&t?.properties?["object"]:Array.isArray(e)?e.length===1?e:e.length===2&&e.indexOf("null")!==-1?e.sort(n=>n=="null"?1:-1):e:e?[e]:[]}addValidator(t,e,n){t.validators=t.validators||{},t.validators[e]=n}isEnum(t){return!!t.enum||t.anyOf&&t.anyOf.every(Kt)||t.oneOf&&t.oneOf.every(Kt)||t.uniqueItems&&t.items&&!Array.isArray(t.items)&&this.isEnum(t.items)}toEnumOptions(t){if(t.enum)return t.enum.map(n=>({value:n,label:n}));let e=n=>{let a=n.hasOwnProperty("const")?n.const:n.enum[0],c={value:a,label:n.title||a};return n.readOnly&&(c.disabled=!0),c};return t.anyOf?t.anyOf.map(e):t.oneOf?t.oneOf.map(e):this.toEnumOptions(t.items)}isFieldValid(t,e,n,a){let c=n[e];c._field||Object.defineProperty(c,"_field",{enumerable:!1,writable:!0,configurable:!0});let h=c._field,d=t.model?t.model:t.fieldArray?[]:{};return t.model&&Q(t)&&(d={[Array.isArray(t.key)?t.key.join("."):t.key]:kt(t)}),d=Gt(d),h?(h.model=d,t.options.build(h)):h=c._field=t.options.build({form:Array.isArray(d)?new Ke([]):new Ge({}),fieldGroup:[this._toFieldConfig(c,w(g({},a),{resetOnHide:!0,ignoreDefault:!0,map:null}))],model:d,options:{}}),h.form.valid}mergeFields(t,e){for(let n in e){let a=n==="templateOptions"?"props":n;X(t[a])&&X(e[n])?t[a]=this.mergeFields(t[a],e[n]):e[n]!=null&&(t[a]=e[n])}return t}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275prov=C({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})()});var ti,xt,Kn,Hi=I(()=>{"use strict";S();ht();$();S();ti="sp_task_widget_settings",xt={isEnabled:!1,isAlwaysShow:!1,opacity:95},Kn=(()=>{class i{constructor(){this._settings=V(this._loadFromStorage()),this.settings=this._settings.asReadonly(),E&&this._notifyElectron(this._settings())}update(t){let e=g(g({},this._settings()),t);this._settings.set(e),this._persistToStorage(e),E&&this._notifyElectron(e)}_loadFromStorage(){if(typeof localStorage>"u")return g({},xt);try{let t=localStorage.getItem(ti);if(!t)return g({},xt);let e=JSON.parse(t);return g(g({},xt),e)}catch(t){return b.err("Failed to read task widget settings from localStorage",t),g({},xt)}}_persistToStorage(t){if(!(typeof localStorage>"u"))try{localStorage.setItem(ti,JSON.stringify(t))}catch(e){b.err("Failed to persist task widget settings to localStorage",e)}}_notifyElectron(t){typeof window>"u"||!window.ea||window.ea.updateTaskWidgetSettings(t)}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275prov=C({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})()});var qi,ei,ii=I(()=>{"use strict";ht();qi=["win-store","mac-store","linux-snap"],ei=()=>{if(!E)return!1;let i=window.ea?.getDistChannel?.();return!i||!qi.includes(i)}});var ni,ai,ri=I(()=>{"use strict";ni=i=>{let s=i.trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/);return s?{major:Number(s[1]),minor:Number(s[2]),patch:Number(s[3]),prerelease:s[4]??null}:null},ai=(i,s)=>{let t=ni(i),e=ni(s);return!t||!e?!1:t.major!==e.major?t.major>e.major:t.minor!==e.minor?t.minor>e.minor:t.patch!==e.patch?t.patch>e.patch:t.prerelease===null&&e.prerelease!==null}});var $i,Qi,Xi,Wi,Yi,da,Ji=I(()=>{"use strict";S();gi();It();at();pi();zt();Te();ri();Fi();Ti();jt();Nt();$();ii();S();$i="https://api.github.com/repos/super-productivity/super-productivity/releases/latest",Qi=30*1e3,Xi=1440*60*1e3,Wi=15*1e3,Yi=/^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,da=(()=>{class i{constructor(){this._http=m(we),this._globalConfigService=m(ut),this._bannerService=m(qe),this._snackService=m(z),this._isCheckInFlight=!1}init(){ei()&&this._globalConfigService.misc$.pipe(tt(t=>t?.isCheckForUpdates!==!1),se(),nt(t=>t?ae(Qi,Xi):j)).subscribe(()=>this.checkForUpdate())}checkForUpdate(){return f(this,arguments,function*({isUserTriggered:t=!1}={}){if(!this._isCheckInFlight){this._isCheckInFlight=!0;try{let n=(yield Z(this._http.get($i,{headers:{Accept:"application/vnd.github+json"}}).pipe(ne(Wi)))).tag_name;if(!n||!Yi.test(n))throw new Error("Malformed release data");if(!ai(n,Rt.version)){t&&this._snackService.open({type:"SUCCESS",msg:u.APP.UPDATE_CHECK.UP_TO_DATE,translateParams:{version:Rt.version}});return}if(!t&&localStorage.getItem(A.UPDATE_CHECK_DISMISSED_VERSION)===n)return;this._showUpdateBanner(n)}catch(e){b.log("Update check failed",{error:e?.message}),t&&this._snackService.open({type:"ERROR",msg:u.APP.UPDATE_CHECK.ERROR})}finally{this._isCheckInFlight=!1}}})}_showUpdateBanner(t){let e=`https://github.com/super-productivity/super-productivity/releases/tag/${t}`;this._bannerService.open({id:He.UpdateAvailable,msg:u.APP.B_UPDATE_AVAILABLE.MSG,translateParams:{version:t},ico:"file_download",isHideDismissBtn:!0,action:{label:u.APP.B_UPDATE_AVAILABLE.DOWNLOAD,fn:()=>{this._rememberVersion(t),window.ea.openExternalUrl(e)}},action2:{label:u.G.DISMISS,fn:()=>this._rememberVersion(t)}})}_rememberVersion(t){localStorage.setItem(A.UPDATE_CHECK_DISMISSED_VERSION,t)}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275prov=C({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})()});var si,oi,Y,Ht,wt,W,ci,qt,li=I(()=>{"use strict";Vt();Si();si=i=>{let s=i?.ids;return Array.isArray(s)?s.length:0},oi=i=>si(i?.task),Y=i=>{if(!i||typeof i!="object")return 0;let s=i;return si(s.task)+oi(s.archiveYoung)+oi(s.archiveOld)},Ht=i=>{if(!i)return null;try{return Y(JSON.parse(i))}catch(s){return null}},wt=i=>{if(!i)return null;try{let s=JSON.parse(i),t=s.project?.ids;return{taskCount:Y(s),projectCount:Array.isArray(t)?t.filter(e=>e!==Me.id).length:0}}catch(s){return null}},W=i=>{if(!i)return!1;try{return D(JSON.parse(i))}catch(s){return!1}},ci=i=>{if(!i)return!1;try{let t=JSON.parse(i).globalConfig?.sync;return t?t.isEnabled===!0||t.syncProvider!==null&&t.syncProvider!==void 0:!1}catch(s){return!1}},qt=(i,s)=>W(i)?i:W(s)?s:i||s||null});var tn,en,St,$t,Ot,Qt,nn,an,ja,rn=I(()=>{"use strict";S();vi();Te();It();at();ze();ui();ht();_i();Pe();Be();Ri();zt();xe();Vt();li();Oi();jt();$();Fe();Bi();Ii();Nt();S();tn=300*1e3,en=30*1e3,St="backup",$t="backup_prev",Ot="super-productivity-backup.json",Qt="super-productivity-backup.prev.json",nn=3,an=10,ja=(()=>{class i{constructor(){this._destroyRef=m(de),this._configService=m(ut),this._stateSnapshotService=m(ft),this._backupService=m(bt),this._localDraftService=m($e),this._snackService=m(z),this._translateService=m(pt),this._platformService=m(Xe),this._localActions$=m(vt),this._isAndroidWebView=m(ke),this._cfg$=this._configService.cfg$.pipe(tt(t=>t.localBackup)),this._triggerBackupSave$=this._cfg$.pipe(nt(t=>t.isEnabled?et(re(tn),this._localActions$.pipe(it(en))):j),ce(()=>ie(this._backup()).pipe(oe(t=>(b.err("LocalBackupService: Backup failed",t),j)))))}init(){this._triggerBackupSave$.pipe(Ie(this._destroyRef)).subscribe()}checkBackupAvailable(){return this._isAndroidWebView?f(this,null,function*(){return(yield this._loadAndroidDbValueSafe(St))?!0:!!(yield this._loadAndroidDbValueSafe($t))}):this._platformService.isIOS()?this._checkBackupAvailableIOS():E?window.ea.checkBackupAvailable():Promise.resolve(!1)}loadBackupElectron(t){return window.ea.loadBackupData(t)}loadBackupAndroid(){return f(this,null,function*(){let[t,e]=yield Promise.all([this._loadAndroidDbValueSafe(St),this._loadAndroidDbValueSafe($t)]);return qt(t,e)??""})}_loadAndroidDbValueSafe(t){return f(this,null,function*(){try{let e=yield this._nativeDbLoad(t);return b.log(`LocalBackupService: read Android backup '${t}' (${e?e.length:0} chars)`),e}catch(e){return b.err(`LocalBackupService: failed to read Android backup '${t}'`,e),null}})}_nativeDbLoad(t){return Bt.loadFromDbWrapped(t)}_nativeDbSave(t,e){return Bt.saveToDbWrapped(t,e)}loadBackupIOS(){return f(this,null,function*(){let[t,e]=yield Promise.all([this._readIOSFileOrNull(Ot),this._readIOSFileOrNull(Qt)]);return qt(t,e)??""})}_loadBestMobileBackupStr(){return this._isAndroidWebView?this.loadBackupAndroid():this.loadBackupIOS()}_checkBackupAvailableIOS(){return f(this,null,function*(){let[t,e]=yield Promise.all([this._iosFileExists(Ot),this._iosFileExists(Qt)]);return t||e})}askForFileStoreBackupIfAvailable(){return f(this,null,function*(){if(!E&&!this._isAndroidWebView&&!this._platformService.isIOS())return;if(E){let e=yield this.checkBackupAvailable();if(typeof e!="boolean"&&B(this._translateService.instant(u.CONFIRM.RESTORE_FILE_BACKUP,{dir:e.folder,from:new Date(e.created).toLocaleString()}))){let n=yield this.loadBackupElectron(e.path);b.log("backupData loaded from Electron backup"),yield this._importBackup(n)}return}let t=yield this._loadBestMobileBackupStr();if(t){if(W(t)&&!ci(t)){if(b.log("mobile backupData auto-restored, length: "+t.length),yield this._importBackup(t)){let n=wt(t);this._snackService.open({type:"SUCCESS",msg:u.GCF.AUTO_BACKUPS.S_AUTO_RESTORED,translateParams:{tasks:n?.taskCount??0,projects:n?.projectCount??0}})}return}B(this._restoreMobilePromptMsg(t))&&(b.log("mobile backupData loaded, length: "+t.length),yield this._importBackup(t))}})}restoreLatestMobileBackupFromSettings(){return f(this,null,function*(){if(!this._isAndroidWebView&&!this._platformService.isIOS())return;let t=yield this._loadBestMobileBackupStr();if(!W(t)){this._snackService.open({type:"WARNING",msg:u.GCF.AUTO_BACKUPS.S_NO_BACKUP_AVAILABLE});return}B(this._restoreMobileFromSettingsPromptMsg(t))&&(b.log("mobile backupData loaded from settings, length: "+t.length),(yield this._importBackup(t))&&this._snackService.open({type:"SUCCESS",msg:u.GCF.AUTO_BACKUPS.S_RESTORE_SUCCESS}))})}_restoreMobilePromptMsg(t){let e=wt(t);return e?this._translateService.instant(u.CONFIRM.RESTORE_FILE_BACKUP_MOBILE,{tasks:e.taskCount,projects:e.projectCount}):this._translateService.instant(u.CONFIRM.RESTORE_FILE_BACKUP_ANDROID)}_restoreMobileFromSettingsPromptMsg(t){let e=wt(t);return this._translateService.instant(u.CONFIRM.RESTORE_FILE_BACKUP_MOBILE_FROM_SETTINGS,{tasks:e?.taskCount??0,projects:e?.projectCount??0})}_backup(){return f(this,null,function*(){let t=yield this._stateSnapshotService.getAllSyncModelDataFromStoreAsync();if(!D(t)){b.warn("LocalBackupService: skipping backup \u2014 empty state");return}let e=!1;E&&(yield this._backupElectron(t),e=!0),this._isAndroidWebView&&(yield this._backupAndroid(t))&&(e=!0),this._platformService.isIOS()&&(yield this._backupIOS(t))&&(e=!0),e&&this._recordLastBackupTime()})}_recordLastBackupTime(){try{localStorage.setItem(A.LAST_LOCAL_BACKUP,Date.now().toString())}catch(t){b.warn("LocalBackupService: failed to record last backup time",t)}}getLastBackupTime(){let t=localStorage.getItem(A.LAST_LOCAL_BACKUP);if(!t)return null;let e=Number(t);return Number.isFinite(e)?e:null}_backupElectron(t){return f(this,null,function*(){let e=yield Z(this._cfg$);yield window.ea.backupAppData({data:t,maxBackupFiles:e.maxBackupFiles??51})})}_isNearEmptyOverwrite(t,e){if(Y(t)>=nn)return!1;let n=Ht(e);return n===null?!1:n>=an}_guardNearEmptyOverwrite(t,e,n){return this._isNearEmptyOverwrite(t,e)?(b.warn(`LocalBackupService: skipping ${n} backup \u2014 near-empty (${Y(t)} tasks) over substantial backup (${Ht(e)} tasks). #7925 A3.`),!0):!1}_backupAndroid(t){return f(this,null,function*(){let e;try{e=yield this._nativeDbLoad(St)}catch(a){return b.err("LocalBackupService: skipping Android backup \u2014 could not read existing slot",a),!1}if(this._guardNearEmptyOverwrite(t,e,"Android"))return!1;e&&(yield this._nativeDbSave($t,e));let n=JSON.stringify(t);return b.log(`LocalBackupService: writing Android backup (${n.length} chars)`),yield this._nativeDbSave(St,n),!0})}_backupIOS(t){return f(this,null,function*(){let e;try{e=yield this._readIOSExistingSlotOrThrow(Ot)}catch(n){return b.err("LocalBackupService: skipping iOS backup \u2014 could not read existing slot",n),!1}if(this._guardNearEmptyOverwrite(t,e,"iOS"))return!1;try{return e&&(yield this._writeIOSFile(Qt,e)),yield this._writeIOSFile(Ot,JSON.stringify(t)),b.log("iOS backup saved successfully"),!0}catch(n){return b.err("Failed to save iOS backup",n),!1}})}_writeIOSFile(t,e){return f(this,null,function*(){yield gt.writeFile({path:t,data:e,directory:_t.Data,encoding:Ut.UTF8})})}_readIOSFileRaw(t){return f(this,null,function*(){return(yield gt.readFile({path:t,directory:_t.Data,encoding:Ut.UTF8})).data})}_readIOSFileOrNull(t){return f(this,null,function*(){try{return yield this._readIOSFileRaw(t)}catch(e){return null}})}_readIOSExistingSlotOrThrow(t){return f(this,null,function*(){try{return yield this._readIOSFileRaw(t)}catch(e){if(!(yield this._iosFileExists(t)))return null;throw e}})}_iosFileExists(t){return f(this,null,function*(){try{return!!(yield gt.stat({path:t,directory:_t.Data}))}catch(e){return!1}})}_importBackup(t){return f(this,null,function*(){try{return yield this._backupService.importCompleteBackup(JSON.parse(t),!1,!0,!0),this._localDraftService.deleteAllDrafts(),!0}catch(e){return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.S_ERR_IMPORT_FAILED}),!1}})}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275prov=C({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})()});var on,sn,cn,ln,mn,dn,hn,pn,un,_n,mi,gn,fn,bn,Xt,vn,wr,Sr,kn=I(()=>{"use strict";S();S();xi();Ei();ki();It();Ai();wi();Li();yi();on=["*"],sn=`.mdc-list {
  margin: 0;
  padding: 8px 0;
  list-style-type: none;
}
.mdc-list:focus {
  outline: none;
}

.mdc-list-item {
  display: flex;
  position: relative;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  align-items: stretch;
  cursor: pointer;
  padding-left: 16px;
  padding-right: 16px;
  background-color: var(--mat-list-list-item-container-color, transparent);
  border-radius: var(--mat-list-list-item-container-shape, var(--mat-sys-corner-none));
}
.mdc-list-item.mdc-list-item--selected {
  background-color: var(--mat-list-list-item-selected-container-color);
}
.mdc-list-item:focus {
  outline: 0;
}
.mdc-list-item.mdc-list-item--disabled {
  cursor: auto;
}
.mdc-list-item.mdc-list-item--with-one-line {
  height: var(--mat-list-list-item-one-line-container-height, 48px);
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__start {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-two-lines {
  height: var(--mat-list-list-item-two-line-container-height, 64px);
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-three-lines {
  height: var(--mat-list-list-item-three-line-container-height, 88px);
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--selected::before, .mdc-list-item.mdc-list-item--selected:focus::before, .mdc-list-item:not(.mdc-list-item--selected):focus::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: "";
  pointer-events: none;
}

a.mdc-list-item {
  color: inherit;
  text-decoration: none;
}

.mdc-list-item__start {
  fill: currentColor;
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--mat-list-list-item-leading-icon-color, var(--mat-sys-on-surface-variant));
  width: var(--mat-list-list-item-leading-icon-size, 24px);
  height: var(--mat-list-list-item-leading-icon-size, 24px);
  margin-left: 16px;
  margin-right: 32px;
}
[dir=rtl] .mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-left: 32px;
  margin-right: 16px;
}
.mdc-list-item--with-leading-icon:hover .mdc-list-item__start {
  color: var(--mat-list-list-item-hover-leading-icon-color);
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start {
  width: var(--mat-list-list-item-leading-avatar-size, 40px);
  height: var(--mat-list-list-item-leading-avatar-size, 40px);
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start, [dir=rtl] .mdc-list-item--with-leading-avatar .mdc-list-item__start {
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}

.mdc-list-item__end {
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  font-family: var(--mat-list-list-item-trailing-supporting-text-font, var(--mat-sys-label-small-font));
  line-height: var(--mat-list-list-item-trailing-supporting-text-line-height, var(--mat-sys-label-small-line-height));
  font-size: var(--mat-list-list-item-trailing-supporting-text-size, var(--mat-sys-label-small-size));
  font-weight: var(--mat-list-list-item-trailing-supporting-text-weight, var(--mat-sys-label-small-weight));
  letter-spacing: var(--mat-list-list-item-trailing-supporting-text-tracking, var(--mat-sys-label-small-tracking));
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-trailing-icon-color, var(--mat-sys-on-surface-variant));
  width: var(--mat-list-list-item-trailing-icon-size, 24px);
  height: var(--mat-list-list-item-trailing-icon-size, 24px);
}
.mdc-list-item--with-trailing-icon:hover .mdc-list-item__end {
  color: var(--mat-list-list-item-hover-trailing-icon-color);
}
.mdc-list-item.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  color: var(--mat-list-list-item-trailing-supporting-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-list-item--selected.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-selected-trailing-icon-color, var(--mat-sys-primary));
}

.mdc-list-item__content {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  align-self: center;
  flex: 1;
  pointer-events: none;
}
.mdc-list-item--with-two-lines .mdc-list-item__content, .mdc-list-item--with-three-lines .mdc-list-item__content {
  align-self: stretch;
}

.mdc-list-item__primary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: var(--mat-list-list-item-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-list-list-item-label-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-list-list-item-label-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-list-list-item-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-list-list-item-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-list-list-item-label-text-tracking, var(--mat-sys-body-large-tracking));
}
.mdc-list-item:hover .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-hover-label-text-color, var(--mat-sys-on-surface));
}
.mdc-list-item:focus .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-focus-label-text-color, var(--mat-sys-on-surface));
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text, .mdc-list-item--with-three-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}

.mdc-list-item__secondary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  margin-top: 0;
  color: var(--mat-list-list-item-supporting-text-color, var(--mat-sys-on-surface-variant));
  font-family: var(--mat-list-list-item-supporting-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-list-list-item-supporting-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-list-list-item-supporting-text-size, var(--mat-sys-body-medium-size));
  font-weight: var(--mat-list-list-item-supporting-text-weight, var(--mat-sys-body-medium-weight));
  letter-spacing: var(--mat-list-list-item-supporting-text-tracking, var(--mat-sys-body-medium-tracking));
}
.mdc-list-item__secondary-text::before {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-three-lines .mdc-list-item__secondary-text {
  white-space: normal;
  line-height: 20px;
}
.mdc-list-item--with-overline .mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: auto;
}

.mdc-list-item--with-leading-radio.mdc-list-item,
.mdc-list-item--with-leading-checkbox.mdc-list-item,
.mdc-list-item--with-leading-icon.mdc-list-item,
.mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
[dir=rtl] .mdc-list-item--with-leading-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-checkbox.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-icon.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  display: block;
  margin-top: 0;
  line-height: normal;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-trailing-icon.mdc-list-item, [dir=rtl] .mdc-list-item--with-trailing-icon.mdc-list-item {
  padding-left: 0;
  padding-right: 0;
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 16px;
}

.mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  -webkit-user-select: none;
  user-select: none;
  margin-left: 28px;
  margin-right: 16px;
}
[dir=rtl] .mdc-list-item--with-trailing-meta .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 28px;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end {
  display: block;
  line-height: normal;
  align-self: flex-start;
  margin-top: 0;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end::before, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-leading-radio .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 8px;
  margin-right: 24px;
}
[dir=rtl] .mdc-list-item--with-leading-radio .mdc-list-item__start,
[dir=rtl] .mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 24px;
  margin-right: 8px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-item--with-trailing-radio.mdc-list-item,
.mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-left: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, [dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-right: 0;
}
.mdc-list-item--with-trailing-radio .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 24px;
  margin-right: 8px;
}
[dir=rtl] .mdc-list-item--with-trailing-radio .mdc-list-item__end,
[dir=rtl] .mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 8px;
  margin-right: 24px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-three-lines .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-group__subheader {
  margin: 0.75rem 16px;
}

.mdc-list-item--disabled .mdc-list-item__start,
.mdc-list-item--disabled .mdc-list-item__content,
.mdc-list-item--disabled .mdc-list-item__end {
  opacity: 1;
}
.mdc-list-item--disabled .mdc-list-item__primary-text,
.mdc-list-item--disabled .mdc-list-item__secondary-text {
  opacity: var(--mat-list-list-item-disabled-label-text-opacity, 0.3);
}
.mdc-list-item--disabled.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--mat-list-list-item-disabled-leading-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-leading-icon-opacity, 0.38);
}
.mdc-list-item--disabled.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--mat-list-list-item-disabled-trailing-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-trailing-icon-opacity, 0.38);
}

.mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing, [dir=rtl] .mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing {
  padding-left: 0;
  padding-right: 0;
}

.mdc-list-item.mdc-list-item--disabled .mdc-list-item__primary-text {
  color: var(--mat-list-list-item-disabled-label-text-color, var(--mat-sys-on-surface));
}

.mdc-list-item:hover::before {
  background-color: var(--mat-list-list-item-hover-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}

.mdc-list-item.mdc-list-item--disabled::before {
  background-color: var(--mat-list-list-item-disabled-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-disabled-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}

.mdc-list-item:focus::before {
  background-color: var(--mat-list-list-item-focus-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-list-list-item-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}

.mdc-list-item--disabled .mdc-radio,
.mdc-list-item--disabled .mdc-checkbox {
  opacity: var(--mat-list-list-item-disabled-label-text-opacity, 0.3);
}

.mdc-list-item--with-leading-avatar .mat-mdc-list-item-avatar {
  border-radius: var(--mat-list-list-item-leading-avatar-shape, var(--mat-sys-corner-full));
  background-color: var(--mat-list-list-item-leading-avatar-color, var(--mat-sys-primary-container));
}

.mat-mdc-list-item-icon {
  font-size: var(--mat-list-list-item-leading-icon-size, 24px);
}

@media (forced-colors: active) {
  a.mdc-list-item--activated::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 10px;
    height: 0;
    border-bottom: solid 10px;
    border-radius: 10px;
  }
  a.mdc-list-item--activated [dir=rtl]::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-list-base {
  display: block;
}
.mat-mdc-list-base .mdc-list-item__start,
.mat-mdc-list-base .mdc-list-item__end,
.mat-mdc-list-base .mdc-list-item__content {
  pointer-events: auto;
}

.mat-mdc-list-item,
.mat-mdc-list-option {
  width: 100%;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-list-item:not(.mat-mdc-list-item-interactive),
.mat-mdc-list-option:not(.mat-mdc-list-item-interactive) {
  cursor: default;
}
.mat-mdc-list-item .mat-divider-inset,
.mat-mdc-list-option .mat-divider-inset {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
.mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-left: 72px;
}
[dir=rtl] .mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
[dir=rtl] .mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-right: 72px;
}

.mat-mdc-list-item-interactive::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  content: "";
  opacity: 0;
  pointer-events: none;
  border-radius: inherit;
}

.mat-mdc-list-item > .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-list-item:focus-visible > .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-line.mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: normal;
}
.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-unscoped-content.mdc-list-item__secondary-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

mat-action-list button {
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  outline: inherit;
  -webkit-tap-highlight-color: transparent;
  text-align: start;
}
mat-action-list button::-moz-focus-inner {
  border: 0;
}

.mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-inline-start: var(--mat-list-list-item-leading-icon-start-space, 16px);
  margin-inline-end: var(--mat-list-list-item-leading-icon-end-space, 16px);
}

.mat-mdc-nav-list .mat-mdc-list-item {
  border-radius: var(--mat-list-active-indicator-shape, var(--mat-sys-corner-full));
  --mat-focus-indicator-border-radius: var(--mat-list-active-indicator-shape, var(--mat-sys-corner-full));
}
.mat-mdc-nav-list .mat-mdc-list-item.mdc-list-item--activated {
  background-color: var(--mat-list-active-indicator-color, var(--mat-sys-secondary-container));
}
`,cn=["unscopedContent"],ln=["text"],mn=[[["","matListItemAvatar",""],["","matListItemIcon",""]],[["","matListItemTitle",""]],[["","matListItemLine",""]],"*",[["","matListItemMeta",""]],[["mat-divider"]]],dn=["[matListItemAvatar],[matListItemIcon]","[matListItemTitle]","[matListItemLine]","*","[matListItemMeta]","mat-divider"],hn=new Ct("ListOption"),pn=(()=>{class i{_elementRef=m(rt);constructor(){}static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,selectors:[["","matListItemTitle",""]],hostAttrs:[1,"mat-mdc-list-item-title","mdc-list-item__primary-text"]})}return i})(),un=(()=>{class i{_elementRef=m(rt);constructor(){}static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,selectors:[["","matListItemLine",""]],hostAttrs:[1,"mat-mdc-list-item-line","mdc-list-item__secondary-text"]})}return i})(),_n=(()=>{class i{static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,selectors:[["","matListItemMeta",""]],hostAttrs:[1,"mat-mdc-list-item-meta","mdc-list-item__end"]})}return i})(),mi=(()=>{class i{_listOption=m(hn,{optional:!0});constructor(){}_isAlignedAtStart(){return!this._listOption||this._listOption?._getTogglePosition()==="after"}static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,hostVars:4,hostBindings:function(e,n){e&2&&mt("mdc-list-item__start",n._isAlignedAtStart())("mdc-list-item__end",!n._isAlignedAtStart())}})}return i})(),gn=(()=>{class i extends mi{static \u0275fac=(()=>{let t;return function(n){return(t||(t=G(i)))(n||i)}})();static \u0275dir=L({type:i,selectors:[["","matListItemAvatar",""]],hostAttrs:[1,"mat-mdc-list-item-avatar"],features:[H]})}return i})(),fn=(()=>{class i extends mi{static \u0275fac=(()=>{let t;return function(n){return(t||(t=G(i)))(n||i)}})();static \u0275dir=L({type:i,selectors:[["","matListItemIcon",""]],hostAttrs:[1,"mat-mdc-list-item-icon"],features:[H]})}return i})(),bn=new Ct("MAT_LIST_CONFIG"),Xt=(()=>{class i{_isNonInteractive=!0;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=P(t)}_disableRipple=!1;get disabled(){return this._disabled()}set disabled(t){this._disabled.set(P(t))}_disabled=V(!1);_defaultOptions=m(bn,{optional:!0});static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,hostVars:1,hostBindings:function(e,n){e&2&&ot("aria-disabled",n.disabled)},inputs:{disableRipple:"disableRipple",disabled:"disabled"}})}return i})(),vn=(()=>{class i{_elementRef=m(rt);_ngZone=m(he);_listBase=m(Xt,{optional:!0});_platform=m(Ce);_hostElement;_isButtonElement;_noopAnimations=De();_avatars;_icons;set lines(t){this._explicitLines=Ae(t,null),this._updateItemLines(!1)}_explicitLines=null;get disableRipple(){return this.disabled||this._disableRipple||this._noopAnimations||!!this._listBase?.disableRipple}set disableRipple(t){this._disableRipple=P(t)}_disableRipple=!1;get disabled(){return this._disabled()||!!this._listBase?.disabled}set disabled(t){this._disabled.set(P(t))}_disabled=V(!1);_subscriptions=new ee;_rippleRenderer=null;_hasUnscopedTextContent=!1;rippleConfig;get rippleDisabled(){return this.disableRipple||!!this.rippleConfig.disabled}constructor(){m(Ee).load(je);let t=m(Ue,{optional:!0});this.rippleConfig=t||{},this._hostElement=this._elementRef.nativeElement,this._isButtonElement=this._hostElement.nodeName.toLowerCase()==="button",this._listBase&&!this._listBase._isNonInteractive&&this._initInteractiveListItem(),this._isButtonElement&&!this._hostElement.hasAttribute("type")&&this._hostElement.setAttribute("type","button")}ngAfterViewInit(){this._monitorProjectedLinesAndTitle(),this._updateItemLines(!0)}ngOnDestroy(){this._subscriptions.unsubscribe(),this._rippleRenderer!==null&&this._rippleRenderer._removeTriggerEvents()}_hasIconOrAvatar(){return!!(this._avatars.length||this._icons.length)}_initInteractiveListItem(){this._hostElement.classList.add("mat-mdc-list-item-interactive"),this._rippleRenderer=new Ne(this,this._ngZone,this._hostElement,this._platform,m(me)),this._rippleRenderer.setupTriggerEvents(this._hostElement)}_monitorProjectedLinesAndTitle(){this._ngZone.runOutsideAngular(()=>{this._subscriptions.add(et(this._lines.changes,this._titles.changes).subscribe(()=>this._updateItemLines(!1)))})}_updateItemLines(t){if(!this._lines||!this._titles||!this._unscopedContent)return;t&&this._checkDomForUnscopedTextContent();let e=this._explicitLines??this._inferLinesFromContent(),n=this._unscopedContent.nativeElement;if(this._hostElement.classList.toggle("mat-mdc-list-item-single-line",e<=1),this._hostElement.classList.toggle("mdc-list-item--with-one-line",e<=1),this._hostElement.classList.toggle("mdc-list-item--with-two-lines",e===2),this._hostElement.classList.toggle("mdc-list-item--with-three-lines",e===3),this._hasUnscopedTextContent){let a=this._titles.length===0&&e===1;n.classList.toggle("mdc-list-item__primary-text",a),n.classList.toggle("mdc-list-item__secondary-text",!a)}else n.classList.remove("mdc-list-item__primary-text"),n.classList.remove("mdc-list-item__secondary-text")}_inferLinesFromContent(){let t=this._titles.length+this._lines.length;return this._hasUnscopedTextContent&&(t+=1),t}_checkDomForUnscopedTextContent(){this._hasUnscopedTextContent=Array.from(this._unscopedContent.nativeElement.childNodes).filter(t=>t.nodeType!==t.COMMENT_NODE).some(t=>!!(t.textContent&&t.textContent.trim()))}static \u0275fac=function(e){return new(e||i)};static \u0275dir=L({type:i,contentQueries:function(e,n,a){if(e&1&&Tt(a,gn,4)(a,fn,4),e&2){let c;F(c=R())&&(n._avatars=c),F(c=R())&&(n._icons=c)}},hostVars:4,hostBindings:function(e,n){e&2&&(ot("aria-disabled",n.disabled)("disabled",n._isButtonElement&&n.disabled||null),mt("mdc-list-item--disabled",n.disabled))},inputs:{lines:"lines",disableRipple:"disableRipple",disabled:"disabled"}})}return i})(),wr=(()=>{class i extends Xt{static \u0275fac=(()=>{let t;return function(n){return(t||(t=G(i)))(n||i)}})();static \u0275cmp=K({type:i,selectors:[["mat-list"]],hostAttrs:[1,"mat-mdc-list","mat-mdc-list-base","mdc-list"],exportAs:["matList"],features:[be([{provide:Xt,useExisting:i}]),H],ngContentSelectors:on,decls:1,vars:0,template:function(e,n){e&1&&(Mt(),T(0))},styles:[sn],encapsulation:2,changeDetection:0})}return i})(),Sr=(()=>{class i extends vn{_lines;_titles;_meta;_unscopedContent;_itemText;get activated(){return this._activated}set activated(t){this._activated=P(t)}_activated=!1;_getAriaCurrent(){return this._hostElement.nodeName==="A"&&this._activated?"page":null}_hasBothLeadingAndTrailing(){return this._meta.length!==0&&(this._avatars.length!==0||this._icons.length!==0)}static \u0275fac=(()=>{let t;return function(n){return(t||(t=G(i)))(n||i)}})();static \u0275cmp=K({type:i,selectors:[["mat-list-item"],["a","mat-list-item",""],["button","mat-list-item",""]],contentQueries:function(e,n,a){if(e&1&&Tt(a,un,5)(a,pn,5)(a,_n,5),e&2){let c;F(c=R())&&(n._lines=c),F(c=R())&&(n._titles=c),F(c=R())&&(n._meta=c)}},viewQuery:function(e,n){if(e&1&&_e(cn,5)(ln,5),e&2){let a;F(a=R())&&(n._unscopedContent=a.first),F(a=R())&&(n._itemText=a.first)}},hostAttrs:[1,"mat-mdc-list-item","mdc-list-item"],hostVars:13,hostBindings:function(e,n){e&2&&(ot("aria-current",n._getAriaCurrent()),mt("mdc-list-item--activated",n.activated)("mdc-list-item--with-leading-avatar",n._avatars.length!==0)("mdc-list-item--with-leading-icon",n._icons.length!==0)("mdc-list-item--with-trailing-meta",n._meta.length!==0)("mat-mdc-list-item-both-leading-and-trailing",n._hasBothLeadingAndTrailing())("_mat-animation-noopable",n._noopAnimations))},inputs:{activated:"activated"},exportAs:["matListItem"],features:[H],ngContentSelectors:dn,decls:10,vars:0,consts:[["unscopedContent",""],[1,"mdc-list-item__content"],[1,"mat-mdc-list-item-unscoped-content",3,"cdkObserveContent"],[1,"mat-focus-indicator"]],template:function(e,n){e&1&&(Mt(mn),T(0),q(1,"span",1),T(2,1),T(3,2),q(4,"span",2,0),ue("cdkObserveContent",function(){return n._updateItemLines(!0)}),T(6,3),st()(),T(7,4),T(8,5),ct(9,"div",3))},dependencies:[Le],encapsulation:2,changeDetection:0})}return i})()});var di,yn,xn,Wt,Cr,wn=I(()=>{"use strict";Ci();di=0,yn=["username","userName","loginName","password","token","apiKey","secret","authorization","notes","authCode","accessToken","host","gitlabBaseUrl","nextcloudBaseUrl","icalUrl","organization","syncFilePath","syncFolderPath","title","originalImgPath","path","content","repo","repoFullname","filterUserName","filterUsername","caldavUrl","api_key","resourceName","name","description","location","calProviderId","summary","filterIncludeRegex","filterExcludeRegex"],xn=(i,s,t)=>yn.includes(i)&&s.length>0?`${i}__${t}`:s,Wt=i=>{if(!(typeof i!="object"||i===null))for(let s in i){if(Object.prototype.hasOwnProperty.call(i,s)){let t=i[s];Array.isArray(t)?t.forEach(e=>{typeof e=="object"&&e!==null&&Wt(e)}):typeof t=="object"&&t!==null?Wt(t):typeof t=="string"&&(i[s]=xn(s,t,di))}di++}},Cr=i=>{let s=Re(i);return Wt(s),JSON.stringify(s)}});var Sn,On,In,Dr,Cn=I(()=>{"use strict";$();zi();Sn="./assets/snd",On=50,In=300,Dr=(i,s=0)=>f(null,null,function*(){let t=`${Sn}/${i.doneSound}`;Pt.log(t);let e=i.isIncreaseDoneSoundPitch?Math.min(s*On,In):0;try{let n=yield We(t);yield Ye(n,i.volume,a=>{a.detune.value=e})}catch(n){Pt.err("Error playing done sound:",n)}})});var En,An,Yt,hi,Xr,Ln=I(()=>{"use strict";S();bi();Be();Pe();Vt();jt();xe();ze();Nt();zt();$();at();Fe();ht();S();En=2e4,An="/api/backup?status=1",Yt="/api/backup",hi="sp-cloud-backup-nudge",Xr=(()=>{class i{constructor(){this._backupService=m(bt),this._stateSnapshotService=m(ft),this._snackService=m(z),this._translateService=m(pt),this._router=m(Oe),this._localActions$=m(vt),this._started=!1,this._watching=!1,this._configured=!1}get isAvailable(){return ye}getSyncKey(){return localStorage.getItem(A.CLOUD_SYNC_KEY)||""}setSyncKey(t){let e=t.trim();e?localStorage.setItem(A.CLOUD_SYNC_KEY,e):localStorage.removeItem(A.CLOUD_SYNC_KEY),e&&this._started&&!this._watching&&this._bootstrap()}isConfigured(){return f(this,null,function*(){try{let t=yield fetch(An,{cache:"no-store"});if(!t.ok)return!1;let e=yield t.json();return this._configured=!!e.configured,this._configured}catch(t){return!1}})}init(){return f(this,null,function*(){this._started||!this.isAvailable||(this._started=!0,yield this._bootstrap())})}uploadIfLocalHasData(t){return f(this,null,function*(){if(!this.getSyncKey())return t&&this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_NEED_KEY}),!1;let e=this._stateSnapshotService.getAllSyncModelDataFromStore();if(!D(e))return t&&this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_NOTHING_TO_SAVE}),!1;try{let n=yield this._backupService.loadCompleteBackup(!0),a=yield fetch(Yt,{method:"PUT",headers:{"Content-Type":"application/json","x-sp-sync-key":this.getSyncKey()},body:JSON.stringify(n)});if(a.status===401)return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_BAD_KEY}),!1;if(a.status===503)return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_NOT_CONFIGURED}),!1;if(!a.ok)throw new Error(yield a.text());return t&&this._snackService.open({type:"SUCCESS",msg:u.FILE_IMEX.CLOUD_SAVED}),!0}catch(n){return b.err("WebCloudBackup upload failed",n),t&&this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_SAVE_FAILED}),!1}})}restoreFromCloud(t){return f(this,null,function*(){if(!this.getSyncKey())return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_NEED_KEY}),!1;try{let e=yield fetch(Yt,{headers:{"x-sp-sync-key":this.getSyncKey()},cache:"no-store"});if(e.status===404)return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_EMPTY}),!1;if(e.status===401)return this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_BAD_KEY}),!1;if(!e.ok)throw new Error(yield e.text());let n=yield e.json(),a=this._stateSnapshotService.getAllSyncModelDataFromStore();return!t&&D(a)&&!B(this._translateService.instant(u.FILE_IMEX.CLOUD_CONFIRM_RESTORE))?!1:(yield this._backupService.importCompleteBackup(n,!0,!0,!0),this._snackService.open({type:"SUCCESS",msg:u.FILE_IMEX.CLOUD_RESTORED}),!0)}catch(e){return b.err("WebCloudBackup restore failed",e),this._snackService.open({type:"ERROR",msg:u.FILE_IMEX.CLOUD_RESTORE_FAILED}),!1}})}_bootstrap(){return f(this,null,function*(){if(!(yield this.isConfigured())){this._nudgeOnce({ico:"cloud_off",msg:u.FILE_IMEX.CLOUD_NOT_CONFIGURED});return}if(!this.getSyncKey()){this._nudgeOnce({ico:"vpn_key",msg:u.FILE_IMEX.CLOUD_NEED_KEY});return}this._watching||(this._watching=!0,yield this._restoreIfLocalEmpty(),yield this.uploadIfLocalHasData(!1),this._localActions$.pipe(it(En)).subscribe(()=>{this.uploadIfLocalHasData(!1)}))})}_nudgeOnce({ico:t,msg:e}){try{if(sessionStorage.getItem(hi))return;sessionStorage.setItem(hi,"1")}catch(n){}this._snackService.open({type:"CUSTOM",ico:t,msg:e,actionStr:u.FILE_IMEX.CLOUD_OPEN_SETTINGS,actionFn:()=>{this._router.navigate(["/config"])},config:{duration:1e4}})}_restoreIfLocalEmpty(){return f(this,null,function*(){let t=this._stateSnapshotService.getAllSyncModelDataFromStore();if(!D(t))try{let e=yield fetch(Yt,{headers:{"x-sp-sync-key":this.getSyncKey()},cache:"no-store"});if(!e.ok)return;let n=yield e.json(),a="data"in n?n.data:n;if(!D(a))return;yield this._backupService.importCompleteBackup(n,!0,!0,!0),this._snackService.open({type:"SUCCESS",msg:u.FILE_IMEX.CLOUD_RESTORED})}catch(e){b.err("WebCloudBackup auto-restore skipped",e)}})}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275prov=C({token:i,factory:i.\u0275fac,providedIn:"root"})}}return i})()});function Dn(i,s){if(i&1&&ct(0,"div",2),i&2){let t=lt();Ft("width",t.size()+"px")("height",t.size()+"px"),Dt("innerHTML",s,pe)}}function Mn(i,s){if(i&1&&(q(0,"mat-icon"),ge(1),st()),i&2){let t=lt();Ft("font-size",t.size()+"px"),Et(),fe(t.fallbackIcon())}}var ro,Tn=I(()=>{"use strict";S();fi();Ui();Di();Ni();S();ro=(()=>{class i{constructor(){this._sanitizer=m(Se),this._pluginService=m(Ze),this.pluginId=dt.required(),this.size=dt(24),this.fallbackIcon=dt("extension"),this.sanitizedSvg=ve(()=>{let t=this.pluginId(),n=this._pluginService.getPluginIconsSignal()().get(t);if(!n)return null;let a=Je(n);return a?this._sanitizer.bypassSecurityTrustHtml(a):null})}static{this.\u0275fac=function(e){return new(e||i)}}static{this.\u0275cmp=K({type:i,selectors:[["plugin-icon"]],inputs:{pluginId:[1,"pluginId"],size:[1,"size"],fallbackIcon:[1,"fallbackIcon"]},decls:2,vars:1,consts:[[1,"plugin-svg-icon",3,"innerHTML","width","height"],[3,"font-size"],[1,"plugin-svg-icon",3,"innerHTML"]],template:function(e,n){if(e&1&&At(0,Dn,1,5,"div",0)(1,Mn,2,3,"mat-icon",1),e&2){let a;Lt((a=n.sanitizedSvg())?0:1,a)}},dependencies:[Ve],styles:[`[_nghost-%COMP%]{display:inline-flex;align-items:center;justify-content:center}[_nghost-%COMP%]   mat-icon[_ngcontent-%COMP%]{display:flex;flex:1}.plugin-svg-icon[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center}.plugin-svg-icon[_ngcontent-%COMP%]     svg{width:100%;height:100%;fill:currentColor}
/*# sourceMappingURL=plugin-icon.component-ATSRPLOY.css.map */`],changeDetection:0})}}return i})()});export{Cr as a,wn as b,Dr as c,Cn as d,Bn as e,Ki as f,Kn as g,Hi as h,ei as i,ii as j,da as k,Ji as l,Xr as m,Ln as n,ro as o,Tn as p,ja as q,rn as r,wr as s,Sr as t,kn as u};
//# sourceMappingURL=chunk-KU5ZLWSZ.js.map
