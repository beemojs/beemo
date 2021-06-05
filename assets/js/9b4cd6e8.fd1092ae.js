(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[55],{5318:function(e,t,r){"use strict";r.d(t,{Zo:function(){return s},kt:function(){return m}});var n=r(7378);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),c=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},s=function(e){var t=c(e.components);return n.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=c(r),m=a,k=u["".concat(p,".").concat(m)]||u[m]||d[m]||o;return r?n.createElement(k,i(i({ref:t},s),{},{components:r})):n.createElement(k,i({ref:t},s))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var c=2;c<o;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},2783:function(e,t,r){"use strict";r.r(t),r.d(t,{frontMatter:function(){return l},metadata:function(){return p},toc:function(){return c},default:function(){return d}});var n=r(9603),a=r(120),o=(r(7378),r(5318)),i=["components"],l={title:"Workspaces"},p={unversionedId:"workspaces",id:"workspaces",isDocsHomePage:!1,title:"Workspaces",description:"Beemo has first class support for executing driver commands across workspaces (monorepos), using",source:"@site/docs/workspaces.md",sourceDirName:".",slug:"/workspaces",permalink:"/docs/workspaces",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/workspaces.md",version:"current",frontMatter:{title:"Workspaces"},sidebar:"docs",previous:{title:"Scaffolding",permalink:"/docs/scaffolding"},next:{title:"Advanced",permalink:"/docs/advanced"}},c=[{value:"Priority packages",id:"priority-packages",children:[]},{value:"Driver support",id:"driver-support",children:[]}],s={toc:c};function d(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Beemo has first class support for executing driver commands across workspaces (monorepos), using\n",(0,o.kt)("a",{parentName:"p",href:"https://yarnpkg.com/lang/en/docs/workspaces/"},"Yarn workspaces")," or\n",(0,o.kt)("a",{parentName:"p",href:"https://github.com/lerna/lerna"},"Lerna packages"),". Once a tool is configured, execute a driver\ncommand with a ",(0,o.kt)("inlineCode",{parentName:"p"},"--workspaces")," option, which signals Beemo to run this command in each of the\nworkspace package folders."),(0,o.kt)("p",null,"This option requires a pattern to match package names against (the name in ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json"),"), or ",(0,o.kt)("inlineCode",{parentName:"p"},"*"),"\nto match all packages. Patterns may need to be quoted."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},'yarn beemo typescript --workspaces=*\n\n// Only in packages that wildcard contain "driver-"\nyarn beemo typescript --workspaces=driver-*\n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Patterns are powered by ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/micromatch/micromatch"},"micromatch"),".")),(0,o.kt)("h2",{id:"priority-packages"},"Priority packages"),(0,o.kt)("p",null,"There are situations where a single package or multiple packages need to be executed before all\nother packages, for example, a core/common/main package. This is very common for typed languages\nlike Flow or TypeScript. By default, Beemo will automatically resolve a priority order based on the\nworkspaces dependency graph. To disable this process, pass a ",(0,o.kt)("inlineCode",{parentName:"p"},"--no-graph")," option."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn beemo typescript --workspaces=* --no-graph\n")),(0,o.kt)("p",null,"Highly depended on packages will be executed in parallel batches, based on the order of dependency,\nfollowed by all remaining packages being executed in parallel batches as well."),(0,o.kt)("h2",{id:"driver-support"},"Driver support"),(0,o.kt)("p",null,"Each driver is designed and built differently, so getting a consistent pattern for workspace support\nis quite difficult. Because of this, per driver usage is broken down into 1 of the following 4\nstrategies."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Root only")," - The driver command should only be ran in the root, with all workspace packages\nbeing referenced as a whole. For example, recursive globbing."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Referenced config")," - The driver command is executed in each package, with the root config file\nbeing referenced using a CLI option (like ",(0,o.kt)("inlineCode",{parentName:"li"},"--config"),")."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Copied config")," - The root config is copied into each package folder before the driver command\nis ran in each. Because of this, we suggest not using the root config for anything else."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"No support")," - Workspaces do not work for this driver.")),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:null},"Driver"),(0,o.kt)("th",{parentName:"tr",align:null},"Support"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Babel"),(0,o.kt)("td",{parentName:"tr",align:null},"Referenced using ",(0,o.kt)("inlineCode",{parentName:"td"},"--config-file"))),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"ESLint"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only (preferred), Referenced using ",(0,o.kt)("inlineCode",{parentName:"td"},"--config"))),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Flow"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Jest"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only (preferred), Referenced using ",(0,o.kt)("inlineCode",{parentName:"td"},"--config"))),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Lerna"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Mocha"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Prettier"),(0,o.kt)("td",{parentName:"tr",align:null},"Root only (preferred), Referenced using ",(0,o.kt)("inlineCode",{parentName:"td"},"--config"))),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Rollup"),(0,o.kt)("td",{parentName:"tr",align:null},"N/A")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"TypeScript"),(0,o.kt)("td",{parentName:"tr",align:null},"Use project references")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Webpack"),(0,o.kt)("td",{parentName:"tr",align:null},"N/A")))))}d.isMDXComponent=!0}}]);