(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[696],{5318:function(e,n,r){"use strict";r.d(n,{Zo:function(){return u},kt:function(){return m}});var t=r(7378);function a(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function i(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function o(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?i(Object(r),!0).forEach((function(n){a(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function l(e,n){if(null==e)return{};var r,t,a=function(e,n){if(null==e)return{};var r,t,a={},i=Object.keys(e);for(t=0;t<i.length;t++)r=i[t],n.indexOf(r)>=0||(a[r]=e[r]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)r=i[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=t.createContext({}),s=function(e){var n=t.useContext(c),r=n;return e&&(r="function"==typeof e?e(n):o(o({},n),e)),r},u=function(e){var n=s(e.components);return t.createElement(c.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},p=t.forwardRef((function(e,n){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(r),m=a,f=p["".concat(c,".").concat(m)]||p[m]||d[m]||i;return r?t.createElement(f,o(o({ref:n},u),{},{components:r})):t.createElement(f,o({ref:n},u))}));function m(e,n){var r=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=p;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=r[s];return t.createElement.apply(null,o)}return t.createElement.apply(null,r)}p.displayName="MDXCreateElement"},517:function(e,n,r){"use strict";var t=r(7378);n.Z=function(e){var n=e.children,r=e.hidden,a=e.className;return t.createElement("div",{role:"tabpanel",hidden:r,className:a},n)}},6359:function(e,n,r){"use strict";r.d(n,{Z:function(){return u}});var t=r(7378),a=r(4309),i=r(8944),o="tabItem_c0e5",l="tabItemActive_28AG";var c=37,s=39;var u=function(e){var n=e.lazy,r=e.block,u=e.defaultValue,d=e.values,p=e.groupId,m=e.className,f=(0,a.Z)(),v=f.tabGroupChoices,b=f.setTabGroupChoices,g=(0,t.useState)(u),y=g[0],h=g[1],k=t.Children.toArray(e.children),O=[];if(null!=p){var C=v[p];null!=C&&C!==y&&d.some((function(e){return e.value===C}))&&h(C)}var N=function(e){var n=e.currentTarget,r=O.indexOf(n),t=d[r].value;h(t),null!=p&&(b(p,t),setTimeout((function(){var e,r,t,a,i,o,c,s;(e=n.getBoundingClientRect(),r=e.top,t=e.left,a=e.bottom,i=e.right,o=window,c=o.innerHeight,s=o.innerWidth,r>=0&&i<=s&&a<=c&&t>=0)||(n.scrollIntoView({block:"center",behavior:"smooth"}),n.classList.add(l),setTimeout((function(){return n.classList.remove(l)}),2e3))}),150))},w=function(e){var n,r;switch(e.keyCode){case s:var t=O.indexOf(e.target)+1;r=O[t]||O[0];break;case c:var a=O.indexOf(e.target)-1;r=O[a]||O[O.length-1]}null==(n=r)||n.focus()};return t.createElement("div",{className:"tabs-container"},t.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":r},m)},d.map((function(e){var n=e.value,r=e.label;return t.createElement("li",{role:"tab",tabIndex:y===n?0:-1,"aria-selected":y===n,className:(0,i.Z)("tabs__item",o,{"tabs__item--active":y===n}),key:n,ref:function(e){return O.push(e)},onKeyDown:w,onFocus:N,onClick:N},r)}))),n?(0,t.cloneElement)(k.filter((function(e){return e.props.value===y}))[0],{className:"margin-vert--md"}):t.createElement("div",{className:"margin-vert--md"},k.map((function(e,n){return(0,t.cloneElement)(e,{key:n,hidden:e.props.value!==y})}))))}},4956:function(e,n,r){"use strict";var t=(0,r(7378).createContext)(void 0);n.Z=t},4309:function(e,n,r){"use strict";var t=r(7378),a=r(4956);n.Z=function(){var e=(0,t.useContext)(a.Z);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},2145:function(e,n,r){"use strict";r.r(n),r.d(n,{frontMatter:function(){return c},metadata:function(){return s},toc:function(){return u},default:function(){return p}});var t=r(9603),a=r(120),i=(r(7378),r(5318)),o=r(6359),l=r(517),c={title:"Lerna driver",sidebar_label:"Lerna"},s={unversionedId:"drivers/lerna",id:"drivers/lerna",isDocsHomePage:!1,title:"Lerna driver",description:"Provides Lerna support by dynamically generating a lerna.json",source:"@site/docs/drivers/lerna.mdx",sourceDirName:"drivers",slug:"/drivers/lerna",permalink:"/docs/drivers/lerna",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/drivers/lerna.mdx",version:"current",sidebar_label:"Lerna",frontMatter:{title:"Lerna driver",sidebar_label:"Lerna"},sidebar:"docs",previous:{title:"Jest driver",permalink:"/docs/drivers/jest"},next:{title:"Mocha driver",permalink:"/docs/drivers/mocha"}},u=[{value:"Requirements",id:"requirements",children:[]},{value:"Installation",id:"installation",children:[]},{value:"Integration",id:"integration",children:[]}],d={toc:u};function p(e){var n=e.components,r=(0,a.Z)(e,["components"]);return(0,i.kt)("wrapper",(0,t.Z)({},d,r,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Provides ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/lerna/lerna"},"Lerna")," support by dynamically generating a ",(0,i.kt)("inlineCode",{parentName:"p"},"lerna.json"),"\nconfig file."),(0,i.kt)("h2",{id:"requirements"},"Requirements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Lerna ^3.0.0 || ^4.0.0")),(0,i.kt)("h2",{id:"installation"},"Installation"),(0,i.kt)("p",null,"In your configuration module, install the driver and Lerna."),(0,i.kt)(o.Z,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},(0,i.kt)(l.Z,{value:"yarn",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @beemo/driver-lerna lerna\n"))),(0,i.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @beemo/driver-lerna lerna\n")))),(0,i.kt)("p",null,"Create a file at ",(0,i.kt)("inlineCode",{parentName:"p"},"configs/lerna.ts")," (or ",(0,i.kt)("inlineCode",{parentName:"p"},"js"),") in which to house your Lerna configuration."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="configs/lerna.ts"',title:'"configs/lerna.ts"'},"import { LernaConfig } from '@beemo/driver-lerna';\n\nconst config: LernaConfig = {\n  version: 'independent',\n  npmClient: 'yarn',\n  useWorkspaces: true,\n  // ...\n};\n\nexport default config;\n")),(0,i.kt)("h2",{id:"integration"},"Integration"),(0,i.kt)("p",null,"In your consuming project, enable the driver by adding ",(0,i.kt)("inlineCode",{parentName:"p"},"lerna")," to your ",(0,i.kt)("inlineCode",{parentName:"p"},"drivers")," config."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: ['lerna'],\n};\n\nexport default config;\n")))}p.isMDXComponent=!0},8944:function(e,n,r){"use strict";function t(e){var n,r,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(n=0;n<e.length;n++)e[n]&&(r=t(e[n]))&&(a&&(a+=" "),a+=r);else for(n in e)e[n]&&(a&&(a+=" "),a+=n);return a}function a(){for(var e,n,r=0,a="";r<arguments.length;)(e=arguments[r++])&&(n=t(e))&&(a&&(a+=" "),a+=n);return a}r.d(n,{Z:function(){return a}})}}]);