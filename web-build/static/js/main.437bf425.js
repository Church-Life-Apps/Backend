(()=>{var e={7520:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>D});var r=t(5932),o=t(9526),i=t(5690),a=t(5861),s=t(9439),u=t(6032),l=t(477),f=t(4333),c=t(5648),d=f.default.create({container:{flex:1,paddingHorizontal:16,backgroundColor:"#fff",alignItems:"center",justifyContent:"center"}}),h=f.default.create({list:{width:"100%",marginTop:c.default.currentHeight||0},contentContainer:{alignSelf:"center",maxWidth:400},item:{paddingVertical:16,paddingHorizontal:12,marginVertical:4,marginHorizontal:16,backgroundColor:"#fff",borderColor:"#4a4a4a",borderRadius:4,borderWidth:1,borderLeftWidth:8},title:{fontSize:16,fontWeight:"bold"},subTitle:{fontSize:12,color:"#4a4a4a"}}),b=f.default.create({container:{flex:1,padding:16,backgroundColor:"#fff"},title:{fontSize:24,fontWeight:"bold",marginBottom:8},author:{fontSize:18,fontStyle:"italic",marginBottom:16},lyrics:{fontSize:16,lineHeight:24,marginBottom:16,marginLeft:20},verseTitle:{fontSize:16,lineHeight:24,fontWeight:"bold"}}),g="https://songs-wzfmn.ondigitalocean.app/api";function m(){return(m=(0,a.default)((function*(){return yield fetch(g+"/songbooks").then((function(e){return e.json()}))}))).apply(this,arguments)}function p(){return(p=(0,a.default)((function*(e){return yield fetch(g+"/songs?songbookId="+e).then((function(e){return e.json()}))}))).apply(this,arguments)}function y(){return(y=(0,a.default)((function*(e,n){return yield fetch(g+"/song?songbookId="+e+"&number="+n).then((function(e){return e.json()}))}))).apply(this,arguments)}var v=t(9566),E=t(9233),T=t(1451),S=t(7557),C=function(e){var n=e.songbook,t=e.onPress;return(0,S.jsx)(T.default,{onPress:t,style:[h.item],children:(0,S.jsx)(E.default,{style:[h.title],children:n.fullName})})};const I=function(e){var n=e.songbooks,t=e.onPress;return(0,S.jsx)(v.default,{data:n,renderItem:function(e){var n=e.item;return(0,S.jsx)(C,{songbook:n,onPress:function(){return t(n)}})},keyExtractor:function(e){return e.id},style:h.list,contentContainerStyle:h.contentContainer})};const R=function(e){var n=e.navigation,t=(0,o.useState)(!0),r=(0,s.default)(t,2),i=r[0],f=r[1],c=(0,o.useState)([]),h=(0,s.default)(c,2),b=h[0],g=h[1],p=function(){var e=(0,a.default)((function*(){var e=yield function(){return m.apply(this,arguments)}();g(e),f(!1)}));return function(){return e.apply(this,arguments)}}();return(0,o.useEffect)((function(){p()}),[]),(0,S.jsx)(l.default,{style:d.container,children:i?(0,S.jsx)(u.default,{}):(0,S.jsx)(I,{songbooks:b,onPress:function(e){n.navigate("Songlist",{songbookId:e.id,title:e.fullName})}})})};var _=function(e){var n=e.song,t=e.onPress;return(0,S.jsxs)(T.default,{onPress:t,style:[h.item],children:[(0,S.jsxs)(E.default,{style:[h.title],children:[n.number,". ",n.title]}),(0,S.jsx)(E.default,{style:[h.subTitle],children:n.author})]})};const j=function(e){var n=e.songs,t=e.songbookFullName,r=e.onPress;return(0,S.jsx)(v.default,{data:n,renderItem:function(e){var n=e.item;return(0,S.jsx)(_,{song:n,onPress:function(){return r(n,t)}})},keyExtractor:function(e){return e.number},style:h.list,contentContainerStyle:h.contentContainer})};const x=function(e){var n=e.navigation,t=e.route,r=(0,o.useState)(!0),i=(0,s.default)(r,2),f=i[0],c=i[1],h=(0,o.useState)([]),b=(0,s.default)(h,2),g=b[0],m=b[1],y=t.params.songbookId,v=t.params.title,E=function(){var e=(0,a.default)((function*(){var e=yield function(e){return p.apply(this,arguments)}(y);m(e),c(!1)}));return function(){return e.apply(this,arguments)}}();(0,o.useEffect)((function(){E()}),[]);return(0,S.jsx)(l.default,{style:d.container,children:f?(0,S.jsx)(u.default,{}):(0,S.jsx)(j,{songs:g,songbookFullName:v,onPress:function(e,t){n.navigate("Song",{songbookId:e.songbookId,number:e.number,title:t+" #"+e.number})}})})};var P,Y=t(2804),k=t(1133),w=t(3433);function O(e){var n="",t=0;for(var r of e)"["===r?t++:"]"===r&&t?t--:t||(n+=r);return n}function L(e,n){for(var t=function(e,n){var t=function(e){return e.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g,"")}((r=e.trim(),r.replace(/\s{2,}/g," "))).split(" ");var r;return n?(0,w.default)(new Set(t)):t}(e.song.presentationOrder,n),r=e.lyrics,o=new Map,i=0;i<r.length;i++){var a=r[i],s=B(a),u={verseShorthand:s,verseTitle:H(r,i),lyrics:O(a.lyrics)};o.set(s,u)}for(var l=[],f=0;f<t.length;f++){var c=o.get(t[f]);null!=c&&l.push(c)}for(var d=0;d<t.length;d++)o.delete(t[d]);for(var h of o.values())l.push(h);return l}function B(e){return(e.lyricType===P.LYRIC_TYPE_BRIDGE?"b":e.lyricType===P.LYRIC_TYPE_CHORUS?"c":e.lyricType===P.LYRIC_TYPE_PRECHORUS?"p":"v")+e.verseNumber}function H(e,n){for(var t=e[n],r=t.lyricType,o=!1,i=0;i<e.length;i++){var a=e[i];if(i!=n&&a.lyricType==r){o=!0;break}}var s=function(e){return e===P.LYRIC_TYPE_BRIDGE?"Bridge":e===P.LYRIC_TYPE_CHORUS?"Chorus":e===P.LYRIC_TYPE_PRECHORUS?"Pre-Chorus":"Verse"}(r);return o?s+" "+t.verseNumber:s}!function(e){e.LYRIC_TYPE_VERSE="LYRIC_TYPE_VERSE",e.LYRIC_TYPE_PRECHORUS="LYRIC_TYPE_PRECHORUS",e.LYRIC_TYPE_CHORUS="LYRIC_TYPE_CHORUS",e.LYRIC_TYPE_BRIDGE="LYRIC_TYPE_BRIDGE"}(P||(P={}));const F=function(e){var n=e.songData,t=e.removeDuplicates,r=n.song,o=L(n,t);return(0,S.jsxs)(k.default,{style:b.container,children:[(0,S.jsx)(E.default,{style:b.title,children:r.title}),(0,S.jsxs)(E.default,{style:b.author,children:["by ",r.author]}),o.map((function(e,n){return(0,S.jsxs)(k.default,{children:[(0,S.jsx)(E.default,{style:b.verseTitle,children:e.verseTitle},n+":verseTitle"),(0,S.jsx)(E.default,{style:b.lyrics,children:e.lyrics},n+":"+e.verseShorthand)]},"View "+n)}))]})};var G=t(586),U={id:(0,G.v4)(),songbookId:"shl",number:1,title:"Great Is Thy Faithfulness",author:"Thomas O. Chisholm",music:"William Marion Runyan (1870-1957)",presentationOrder:"v1 c1 v2 c1 v3 c1",imageUrl:"https://raw.githubusercontent.com/Church-Life-Apps/Resources/master/resources/images/shl/SHL_010.png",audioUrl:"https://raw.githubusercontent.com/brandonxia01/CodingClub/master/websites/piano/notes/c-4.mp3"},A=((0,G.v4)(),{song:U,lyrics:[{songId:(0,G.v4)(),lyricType:P.LYRIC_TYPE_VERSE,verseNumber:1,lyrics:'[Eb]"Great is Thy [Ab]faithfulness," [Bb7]O God my [Ab/Eb]Fa[Eb]ther,\n[Ab]There is no [Eb/G]shadow of [F/C]turn[C7]ing [F7]with [Bb]Thee;\n[Bb7]Thou changest [Eb]not, Thy com[Eb]passions, they [Ab]fail not;\n[Adim7]As Thou hast [Eb/Bb]been Thou forever [Bb7]wilt [Eb]be.'},{songId:(0,G.v4)(),lyricType:P.LYRIC_TYPE_VERSE,verseNumber:2,lyrics:"Summer and winter, and springtime and harvest.\nSun, moon and stars in their courses above,\nJoin with all nature in manifold witness,\nTo Thy great faithfulness, mercy and love."},{songId:(0,G.v4)(),lyricType:P.LYRIC_TYPE_VERSE,verseNumber:3,lyrics:"Pardon for sin and a peace that endureth.\nThy own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!"},{songId:(0,G.v4)(),lyricType:P.LYRIC_TYPE_CHORUS,verseNumber:1,lyrics:'[Bb]"Great is Thy [Ab/Eb]faithful[Eb]ness!"\n[C7]"Great is Thy [Bbm/F]faithful[Fm]ness!"\n[Bb7]Morning by [Eb]morning new [Bb/F]mercies [F7]I [Bb]see;\n[Bb7]All I have [Eb]needed Thy [Eb]hand [Fm]hath [Eb/G]pro[Fm]vided -\n[Adim7]"Great is Thy [Eb/Bb]faithfulness," Lord, [Bb7]unto [Eb]me!'}]});const N=function(e){var n=e.route,t=(0,o.useState)(!0),r=(0,s.default)(t,2),i=r[0],f=r[1],c=(0,o.useState)(A),h=(0,s.default)(c,2),b=h[0],g=h[1],m=n.params.songbookId,p=n.params.number,v=function(){var e=(0,a.default)((function*(){var e=yield function(e,n){return y.apply(this,arguments)}(m,p);g(e),f(!1)}));return function(){return e.apply(this,arguments)}}();return(0,o.useEffect)((function(){v()}),[]),(0,S.jsx)(l.default,{style:d.container,children:i?(0,S.jsx)(u.default,{}):(0,S.jsx)(F,{songData:b,removeDuplicates:!1})})};var z=(0,r.default)(),V={prefixes:[Y.createURL("/")],config:{screens:{Home:"/",Songlist:":songbookId",Song:":songbookId/:number"}}};function D(){return(0,S.jsx)(i.default,{linking:V,children:(0,S.jsxs)(z.Navigator,{children:[(0,S.jsx)(z.Screen,{name:"Home",component:R,options:function(){return{title:"Select A Songbook!"}}}),(0,S.jsx)(z.Screen,{name:"Songlist",component:x,options:function(e){return{title:e.route.params.title}}}),(0,S.jsx)(z.Screen,{name:"Song",component:N,options:function(e){var n=e.route;return{songbookId:n.params.songbookId,number:n.params.number,title:n.params.title}}})]})})}},4654:()=>{}},n={};function t(r){var o=n[r];if(void 0!==o)return o.exports;var i=n[r]={exports:{}};return e[r].call(i.exports,i,i.exports,t),i.exports}t.m=e,(()=>{var e=[];t.O=(n,r,o,i)=>{if(!r){var a=1/0;for(f=0;f<e.length;f++){for(var[r,o,i]=e[f],s=!0,u=0;u<r.length;u++)(!1&i||a>=i)&&Object.keys(t.O).every((e=>t.O[e](r[u])))?r.splice(u--,1):(s=!1,i<a&&(a=i));if(s){e.splice(f--,1);var l=o();void 0!==l&&(n=l)}}return n}i=i||0;for(var f=e.length;f>0&&e[f-1][2]>i;f--)e[f]=e[f-1];e[f]=[r,o,i]}})(),t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}(),t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e={179:0};t.O.j=n=>0===e[n];var n=(n,r)=>{var o,i,[a,s,u]=r,l=0;if(a.some((n=>0!==e[n]))){for(o in s)t.o(s,o)&&(t.m[o]=s[o]);if(u)var f=u(t)}for(n&&n(r);l<a.length;l++)i=a[l],t.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return t.O(f)},r=self.webpackChunkweb=self.webpackChunkweb||[];r.forEach(n.bind(null,0)),r.push=n.bind(null,r.push.bind(r))})();var r=t.O(void 0,[606],(()=>t(9484)));r=t.O(r)})();
//# sourceMappingURL=main.437bf425.js.map