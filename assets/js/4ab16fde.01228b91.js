(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[342],{5318:function(e,t,n){"use strict";n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(7378);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),f=u(n),d=o,m=f["".concat(s,".").concat(d)]||f[d]||p[d]||i;return n?r.createElement(m,a(a({ref:t},c),{},{components:n})):r.createElement(m,a({ref:t},c))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var u=2;u<i;u++)a[u]=n[u];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},517:function(e,t,n){"use strict";var r=n(7378);t.Z=function(e){var t=e.children,n=e.hidden,o=e.className;return r.createElement("div",{role:"tabpanel",hidden:n,className:o},t)}},6359:function(e,t,n){"use strict";n.d(t,{Z:function(){return c}});var r=n(7378),o=n(4309),i=n(8944),a="tabItem_c0e5",l="tabItemActive_28AG";var s=37,u=39;var c=function(e){var t=e.lazy,n=e.block,c=e.defaultValue,p=e.values,f=e.groupId,d=e.className,m=(0,o.Z)(),v=m.tabGroupChoices,g=m.setTabGroupChoices,b=(0,r.useState)(c),y=b[0],k=b[1],w=r.Children.toArray(e.children),h=[];if(null!=f){var N=v[f];null!=N&&N!==y&&p.some((function(e){return e.value===N}))&&k(N)}var C=function(e){var t=e.currentTarget,n=h.indexOf(t),r=p[n].value;k(r),null!=f&&(g(f,r),setTimeout((function(){var e,n,r,o,i,a,s,u;(e=t.getBoundingClientRect(),n=e.top,r=e.left,o=e.bottom,i=e.right,a=window,s=a.innerHeight,u=a.innerWidth,n>=0&&i<=u&&o<=s&&r>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(l),setTimeout((function(){return t.classList.remove(l)}),2e3))}),150))},O=function(e){var t,n;switch(e.keyCode){case u:var r=h.indexOf(e.target)+1;n=h[r]||h[0];break;case s:var o=h.indexOf(e.target)-1;n=h[o]||h[h.length-1]}null==(t=n)||t.focus()};return r.createElement("div",{className:"tabs-container"},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":n},d)},p.map((function(e){var t=e.value,n=e.label;return r.createElement("li",{role:"tab",tabIndex:y===t?0:-1,"aria-selected":y===t,className:(0,i.Z)("tabs__item",a,{"tabs__item--active":y===t}),key:t,ref:function(e){return h.push(e)},onKeyDown:O,onFocus:C,onClick:C},n)}))),t?(0,r.cloneElement)(w.filter((function(e){return e.props.value===y}))[0],{className:"margin-vert--md"}):r.createElement("div",{className:"margin-vert--md"},w.map((function(e,t){return(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==y})}))))}},4956:function(e,t,n){"use strict";var r=(0,n(7378).createContext)(void 0);t.Z=r},4309:function(e,t,n){"use strict";var r=n(7378),o=n(4956);t.Z=function(){var e=(0,r.useContext)(o.Z);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},6609:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return u},metadata:function(){return c},toc:function(){return p},default:function(){return d}});var r=n(9603),o=n(120),i=(n(7378),n(5318)),a=n(6359),l=n(517),s=["components"],u={title:"Flow driver",sidebar_label:"Flow"},c={unversionedId:"drivers/flow",id:"drivers/flow",isDocsHomePage:!1,title:"Flow driver",description:"Provides Flow support by dynamically generating a .flowconfig",source:"@site/docs/drivers/flow.mdx",sourceDirName:"drivers",slug:"/drivers/flow",permalink:"/docs/drivers/flow",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/drivers/flow.mdx",version:"current",sidebar_label:"Flow",frontMatter:{title:"Flow driver",sidebar_label:"Flow"},sidebar:"docs",previous:{title:"ESLint driver",permalink:"/docs/drivers/eslint"},next:{title:"Jest driver",permalink:"/docs/drivers/jest"}},p=[{value:"Requirements",id:"requirements",children:[]},{value:"Installation",id:"installation",children:[{value:"Config format",id:"config-format",children:[]}]},{value:"Integration",id:"integration",children:[]}],f={toc:p};function d(e){var t=e.components,n=(0,o.Z)(e,s);return(0,i.kt)("wrapper",(0,r.Z)({},f,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Provides ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/facebook/flow"},"Flow")," support by dynamically generating a ",(0,i.kt)("inlineCode",{parentName:"p"},".flowconfig"),"\nconfig file."),(0,i.kt)("h2",{id:"requirements"},"Requirements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Flow")),(0,i.kt)("h2",{id:"installation"},"Installation"),(0,i.kt)("p",null,"In your configuration module, install the driver and Flow."),(0,i.kt)(a.Z,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},(0,i.kt)(l.Z,{value:"yarn",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @beemo/driver-flow flow-bin\n"))),(0,i.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @beemo/driver-flow flow-bin\n")))),(0,i.kt)("p",null,"Create a file at ",(0,i.kt)("inlineCode",{parentName:"p"},"configs/flow.ts")," (or ",(0,i.kt)("inlineCode",{parentName:"p"},".js"),") in which to house your Flow configuration."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="configs/flow.ts"',title:'"configs/flow.ts"'},"import { FlowConfig } from '@beemo/driver-flow';\n\nconst config: FlowConfig = {\n  ignore: ['.*/node_modules/.*', '.*/tests/.*', '.*\\\\.test\\\\.js'],\n  include: ['./src'],\n  lints: {\n    untyped_import: 'warn',\n  },\n  options: {\n    emoji: true,\n    'module.ignore_non_literal_requires': true,\n    suppress_comment: '\\\\\\\\(.\\\\\\\\|\\\\n\\\\\\\\)*\\\\\\\\$FlowFixMe',\n  },\n};\n\nexport default config;\n")),(0,i.kt)("h3",{id:"config-format"},"Config format"),(0,i.kt)("p",null,"In Beemo, Flow is configured using a JavaScript/TypeScript file, and not the ",(0,i.kt)("inlineCode",{parentName:"p"},".flowconfig")," file. To\nsupport this, the following conventions must be followed."),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"ignore"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"include"),", and ",(0,i.kt)("inlineCode",{parentName:"li"},"libs")," are an array of strings."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"lints")," is an object. Properties are snake case (underscored instead of dashed)."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"options")," is an object.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"Properties with a period must be quoted."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"suppress_comment")," must be double escaped or use ",(0,i.kt)("inlineCode",{parentName:"li"},"RegExp"),"."))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"version")," is a string.")),(0,i.kt)("p",null,"An example can be seen above."),(0,i.kt)("h2",{id:"integration"},"Integration"),(0,i.kt)("p",null,"In your consuming project, enable the driver by adding ",(0,i.kt)("inlineCode",{parentName:"p"},"flow")," to your ",(0,i.kt)("inlineCode",{parentName:"p"},"drivers")," config."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: ['flow'],\n};\n\nexport default config;\n")))}d.isMDXComponent=!0},8944:function(e,t,n){"use strict";function r(e){var t,n,o="";if("string"==typeof e||"number"==typeof e)o+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(o&&(o+=" "),o+=n);else for(t in e)e[t]&&(o&&(o+=" "),o+=t);return o}function o(){for(var e,t,n=0,o="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(o&&(o+=" "),o+=t);return o}n.d(t,{Z:function(){return o}})}}]);