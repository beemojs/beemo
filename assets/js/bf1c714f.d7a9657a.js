(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{102:function(e,n,t){"use strict";t.d(n,"a",(function(){return b})),t.d(n,"b",(function(){return m}));var r=t(0),a=t.n(r);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=a.a.createContext({}),u=function(e){var n=a.a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},b=function(e){var n=u(e.components);return a.a.createElement(s.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.a.createElement(a.a.Fragment,{},n)}},p=a.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),b=u(t),p=r,m=b["".concat(i,".").concat(p)]||b[p]||d[p]||o;return t?a.a.createElement(m,l(l({ref:n},s),{},{components:t})):a.a.createElement(m,l({ref:n},s))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,i=new Array(o);i[0]=p;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var s=2;s<o;s++)i[s]=t[s];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,t)}p.displayName="MDXCreateElement"},103:function(e,n,t){"use strict";function r(e){var n,t,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(n=0;n<e.length;n++)e[n]&&(t=r(e[n]))&&(a&&(a+=" "),a+=t);else for(n in e)e[n]&&(a&&(a+=" "),a+=n);return a}n.a=function(){for(var e,n,t=0,a="";t<arguments.length;)(e=arguments[t++])&&(n=r(e))&&(a&&(a+=" "),a+=n);return a}},104:function(e,n,t){"use strict";var r=t(0),a=t(105);n.a=function(){var e=Object(r.useContext)(a.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},105:function(e,n,t){"use strict";var r=t(0),a=Object(r.createContext)(void 0);n.a=a},106:function(e,n,t){"use strict";var r=t(0),a=t.n(r),o=t(104),i=t(103),l=t(56),c=t.n(l);var s=37,u=39;n.a=function(e){var n=e.lazy,t=e.block,l=e.defaultValue,b=e.values,d=e.groupId,p=e.className,m=Object(o.a)(),f=m.tabGroupChoices,v=m.setTabGroupChoices,g=Object(r.useState)(l),y=g[0],O=g[1],j=r.Children.toArray(e.children),h=[];if(null!=d){var w=f[d];null!=w&&w!==y&&b.some((function(e){return e.value===w}))&&O(w)}var N=function(e){var n=e.target,t=h.indexOf(n),r=j[t].props.value;O(r),null!=d&&(v(d,r),setTimeout((function(){var e,t,r,a,o,i,l,s;(e=n.getBoundingClientRect(),t=e.top,r=e.left,a=e.bottom,o=e.right,i=window,l=i.innerHeight,s=i.innerWidth,t>=0&&o<=s&&a<=l&&r>=0)||(n.scrollIntoView({block:"center",behavior:"smooth"}),n.classList.add(c.a.tabItemActive),setTimeout((function(){return n.classList.remove(c.a.tabItemActive)}),2e3))}),150))},C=function(e){var n,t;switch(e.keyCode){case u:var r=h.indexOf(e.target)+1;t=h[r]||h[0];break;case s:var a=h.indexOf(e.target)-1;t=h[a]||h[h.length-1]}null===(n=t)||void 0===n||n.focus()};return a.a.createElement("div",{className:"tabs-container"},a.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(i.a)("tabs",{"tabs--block":t},p)},b.map((function(e){var n=e.value,t=e.label;return a.a.createElement("li",{role:"tab",tabIndex:y===n?0:-1,"aria-selected":y===n,className:Object(i.a)("tabs__item",c.a.tabItem,{"tabs__item--active":y===n}),key:n,ref:function(e){return h.push(e)},onKeyDown:C,onFocus:N,onClick:N},t)}))),n?Object(r.cloneElement)(j.filter((function(e){return e.props.value===y}))[0],{className:"margin-vert--md"}):a.a.createElement("div",{className:"margin-vert--md"},j.map((function(e,n){return Object(r.cloneElement)(e,{key:n,hidden:e.props.value!==y})}))))}},107:function(e,n,t){"use strict";var r=t(0),a=t.n(r);n.a=function(e){var n=e.children,t=e.hidden,r=e.className;return a.a.createElement("div",{role:"tabpanel",hidden:t,className:r},n)}},95:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return c})),t.d(n,"metadata",(function(){return s})),t.d(n,"toc",(function(){return u})),t.d(n,"default",(function(){return d}));var r=t(3),a=t(7),o=(t(0),t(102)),i=t(106),l=t(107),c={title:"Lerna driver",sidebar_label:"Lerna"},s={unversionedId:"drivers/lerna",id:"drivers/lerna",isDocsHomePage:!1,title:"Lerna driver",description:"Provides Lerna support by dynamically generating a lerna.json",source:"@site/docs/drivers/lerna.mdx",slug:"/drivers/lerna",permalink:"/docs/drivers/lerna",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/drivers/lerna.mdx",version:"current",sidebar_label:"Lerna",sidebar:"docs",previous:{title:"Jest driver",permalink:"/docs/drivers/jest"},next:{title:"Mocha driver",permalink:"/docs/drivers/mocha"}},u=[{value:"Requirements",id:"requirements",children:[]},{value:"Installation",id:"installation",children:[]},{value:"Integration",id:"integration",children:[]}],b={toc:u};function d(e){var n=e.components,t=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},b,t,{components:n,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Provides ",Object(o.b)("a",{parentName:"p",href:"https://github.com/lerna/lerna"},"Lerna")," support by dynamically generating a ",Object(o.b)("inlineCode",{parentName:"p"},"lerna.json"),"\nconfig file."),Object(o.b)("h2",{id:"requirements"},"Requirements"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"Lerna ^3.0.0 || ^4.0.0")),Object(o.b)("h2",{id:"installation"},"Installation"),Object(o.b)("p",null,"In your configuration module, install the driver and Lerna."),Object(o.b)(i.a,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},Object(o.b)(l.a,{value:"yarn",mdxType:"TabItem"},Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-bash"},"yarn add @beemo/driver-lerna lerna\n"))),Object(o.b)(l.a,{value:"npm",mdxType:"TabItem"},Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-bash"},"npm install @beemo/driver-lerna lerna\n")))),Object(o.b)("p",null,"Create a file at ",Object(o.b)("inlineCode",{parentName:"p"},"configs/lerna.ts")," (or ",Object(o.b)("inlineCode",{parentName:"p"},"js"),") in which to house your Lerna configuration."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="configs/lerna.ts"',title:'"configs/lerna.ts"'},"import { LernaConfig } from '@beemo/driver-lerna';\n\nconst config: LernaConfig = {\n  version: 'independent',\n  npmClient: 'yarn',\n  useWorkspaces: true,\n  // ...\n};\n\nexport default config;\n")),Object(o.b)("h2",{id:"integration"},"Integration"),Object(o.b)("p",null,"In your consuming project, enable the driver by adding ",Object(o.b)("inlineCode",{parentName:"p"},"lerna")," to your ",Object(o.b)("inlineCode",{parentName:"p"},"drivers")," config."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: ['lerna'],\n};\n\nexport default config;\n")))}d.isMDXComponent=!0}}]);