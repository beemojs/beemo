(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[971],{5318:function(e,t,n){"use strict";n.d(t,{Zo:function(){return s},kt:function(){return m}});var r=n(7378);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var u=r.createContext({}),c=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,u=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=c(n),m=o,f=d["".concat(u,".").concat(m)]||d[m]||p[m]||i;return n?r.createElement(f,a(a({ref:t},s),{},{components:n})):r.createElement(f,a({ref:t},s))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=d;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var c=2;c<i;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8975:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return l},metadata:function(){return u},toc:function(){return c},default:function(){return p}});var r=n(9603),o=n(120),i=(n(7378),n(5318)),a=["components"],l={title:"Introduction",slug:"/"},u={unversionedId:"index",id:"index",isDocsHomePage:!1,title:"Introduction",description:"Manage developer and build tools, their configuration, and commands in a single centralized",source:"@site/docs/index.md",sourceDirName:".",slug:"/",permalink:"/docs/",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/index.md",version:"current",frontMatter:{title:"Introduction",slug:"/"},sidebar:"docs",next:{title:"Provider setup",permalink:"/docs/provider"}},c=[{value:"Features",id:"features",children:[]},{value:"Requirements",id:"requirements",children:[]}],s={toc:c};function p(e){var t=e.components,n=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Manage developer and build tools, their configuration, and commands in a single centralized\nrepository. Beemo aims to solve the multi-project maintenance fatigue by removing the following\nburdens across all projects: config and dotfile management, multiple config patterns, up-to-date\ndevelopment dependencies, continuous copy and paste, and more."),(0,i.kt)("h2",{id:"features"},"Features"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Manage dev tools and configurations in a single repository."),(0,i.kt)("li",{parentName:"ul"},"Configure supported dev tools using ",(0,i.kt)("inlineCode",{parentName:"li"},".ts")," or ",(0,i.kt)("inlineCode",{parentName:"li"},".js")," files."),(0,i.kt)("li",{parentName:"ul"},"Customize and alter config at runtime with CLI options."),(0,i.kt)("li",{parentName:"ul"},"Pass custom CLI options to dev tool commands without failure."),(0,i.kt)("li",{parentName:"ul"},"Automatically expand glob patterns (a better alternative to bash)."),(0,i.kt)("li",{parentName:"ul"},"Listen to and act upon events."),(0,i.kt)("li",{parentName:"ul"},"Easily share config between dev tools."),(0,i.kt)("li",{parentName:"ul"},"Avoid relative config or ",(0,i.kt)("inlineCode",{parentName:"li"},"extend")," paths."),(0,i.kt)("li",{parentName:"ul"},"Automatic config file cleanup."),(0,i.kt)("li",{parentName:"ul"},"Custom scripts with CLI options."),(0,i.kt)("li",{parentName:"ul"},"Scaffolding and template generation."),(0,i.kt)("li",{parentName:"ul"},"Workspaces (monorepo) support."),(0,i.kt)("li",{parentName:"ul"},"Parallel, pooled, and prioritized builds."),(0,i.kt)("li",{parentName:"ul"},"And much more.")),(0,i.kt)("h2",{id:"requirements"},"Requirements"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Node 12+"),(0,i.kt)("li",{parentName:"ul"},"GitHub, Bitbucket, or another VCS")))}p.isMDXComponent=!0}}]);