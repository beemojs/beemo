(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{102:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var r=n(0),i=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=i.a.createContext({}),b=function(e){var t=i.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=b(e.components);return i.a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),u=b(n),d=r,m=u["".concat(o,".").concat(d)]||u[d]||p[d]||a;return n?i.a.createElement(m,l(l({ref:t},s),{},{components:n})):i.a.createElement(m,l({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var s=2;s<a;s++)o[s]=n[s];return i.a.createElement.apply(null,o)}return i.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},103:function(e,t,n){"use strict";function r(e){var t,n,i="";if("string"==typeof e||"number"==typeof e)i+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(i&&(i+=" "),i+=n);else for(t in e)e[t]&&(i&&(i+=" "),i+=t);return i}t.a=function(){for(var e,t,n=0,i="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(i&&(i+=" "),i+=t);return i}},104:function(e,t,n){"use strict";var r=n(0),i=n(105);t.a=function(){var e=Object(r.useContext)(i.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},105:function(e,t,n){"use strict";var r=n(0),i=Object(r.createContext)(void 0);t.a=i},106:function(e,t,n){"use strict";var r=n(0),i=n.n(r),a=n(104),o=n(103),l=n(56),c=n.n(l);var s=37,b=39;t.a=function(e){var t=e.lazy,n=e.block,l=e.defaultValue,u=e.values,p=e.groupId,d=e.className,m=Object(a.a)(),f=m.tabGroupChoices,g=m.setTabGroupChoices,v=Object(r.useState)(l),O=v[0],j=v[1],y=r.Children.toArray(e.children),h=[];if(null!=p){var N=f[p];null!=N&&N!==O&&u.some((function(e){return e.value===N}))&&j(N)}var C=function(e){var t=e.target,n=h.indexOf(t),r=y[n].props.value;j(r),null!=p&&(g(p,r),setTimeout((function(){var e,n,r,i,a,o,l,s;(e=t.getBoundingClientRect(),n=e.top,r=e.left,i=e.bottom,a=e.right,o=window,l=o.innerHeight,s=o.innerWidth,n>=0&&a<=s&&i<=l&&r>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(c.a.tabItemActive),setTimeout((function(){return t.classList.remove(c.a.tabItemActive)}),2e3))}),150))},E=function(e){var t,n;switch(e.keyCode){case b:var r=h.indexOf(e.target)+1;n=h[r]||h[0];break;case s:var i=h.indexOf(e.target)-1;n=h[i]||h[h.length-1]}null===(t=n)||void 0===t||t.focus()};return i.a.createElement("div",{className:"tabs-container"},i.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(o.a)("tabs",{"tabs--block":n},d)},u.map((function(e){var t=e.value,n=e.label;return i.a.createElement("li",{role:"tab",tabIndex:O===t?0:-1,"aria-selected":O===t,className:Object(o.a)("tabs__item",c.a.tabItem,{"tabs__item--active":O===t}),key:t,ref:function(e){return h.push(e)},onKeyDown:E,onFocus:C,onClick:C},n)}))),t?Object(r.cloneElement)(y.filter((function(e){return e.props.value===O}))[0],{className:"margin-vert--md"}):i.a.createElement("div",{className:"margin-vert--md"},y.map((function(e,t){return Object(r.cloneElement)(e,{key:t,hidden:e.props.value!==O})}))))}},107:function(e,t,n){"use strict";var r=n(0),i=n.n(r);t.a=function(e){var t=e.children,n=e.hidden,r=e.className;return i.a.createElement("div",{role:"tabpanel",hidden:n,className:r},t)}},94:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return b})),n.d(t,"default",(function(){return p}));var r=n(3),i=n(7),a=(n(0),n(102)),o=n(106),l=n(107),c={title:"ESLint driver",sidebar_label:"ESLint"},s={unversionedId:"drivers/eslint",id:"drivers/eslint",isDocsHomePage:!1,title:"ESLint driver",description:"Provides ESLint support by dynamically generating a",source:"@site/docs/drivers/eslint.mdx",slug:"/drivers/eslint",permalink:"/docs/drivers/eslint",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/drivers/eslint.mdx",version:"current",sidebar_label:"ESLint",sidebar:"docs",previous:{title:"Babel driver",permalink:"/docs/drivers/babel"},next:{title:"Flow driver",permalink:"/docs/drivers/flow"}},b=[{value:"Requirements",id:"requirements",children:[]},{value:"Events",id:"events",children:[]},{value:"Installation",id:"installation",children:[]},{value:"Integration",id:"integration",children:[]},{value:"Ignoring paths",id:"ignoring-paths",children:[]}],u={toc:b};function p(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Provides ",Object(a.b)("a",{parentName:"p",href:"https://github.com/eslint/eslint"},"ESLint")," support by dynamically generating a\n",Object(a.b)("inlineCode",{parentName:"p"},".eslintrc.js")," config file."),Object(a.b)("h2",{id:"requirements"},"Requirements"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"ESLint ^7.0.0")),Object(a.b)("h2",{id:"events"},"Events"),Object(a.b)("p",null,"Can be listened to on the ",Object(a.b)("inlineCode",{parentName:"p"},"ESLintDriver")," instance."),Object(a.b)("table",null,Object(a.b)("thead",{parentName:"table"},Object(a.b)("tr",{parentName:"thead"},Object(a.b)("th",{parentName:"tr",align:null},"Event"),Object(a.b)("th",{parentName:"tr",align:null},"Arguments"),Object(a.b)("th",{parentName:"tr",align:null},"Description"))),Object(a.b)("tbody",{parentName:"table"},Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",{parentName:"tr",align:null},Object(a.b)("inlineCode",{parentName:"td"},"onCreateIgnoreFile")),Object(a.b)("td",{parentName:"tr",align:null},Object(a.b)("inlineCode",{parentName:"td"},"context: ConfigContext, path: Path, config: { ignore: string[] }")),Object(a.b)("td",{parentName:"tr",align:null},"Called before the ignore file is written.")))),Object(a.b)("h2",{id:"installation"},"Installation"),Object(a.b)("p",null,"In your configuration module, install the driver, ESLint, and any plugins."),Object(a.b)(o.a,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},Object(a.b)(l.a,{value:"yarn",mdxType:"TabItem"},Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash"},"yarn add @beemo/driver-eslint eslint eslint-config-airbnb\n"))),Object(a.b)(l.a,{value:"npm",mdxType:"TabItem"},Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash"},"npm install @beemo/driver-eslint eslint eslint-config-airbnb\n")))),Object(a.b)("p",null,"Create a file at ",Object(a.b)("inlineCode",{parentName:"p"},"configs/eslint.ts")," (or ",Object(a.b)("inlineCode",{parentName:"p"},"js"),") in which to house your ESLint configuration."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="configs/eslint.ts"',title:'"configs/eslint.ts"'},"import { ESLintConfig } from '@beemo/driver-eslint';\n\nconst config: ESLintConfig = {\n  extends: ['airbnb'],\n  // ...\n};\n\nexport default config;\n")),Object(a.b)("h2",{id:"integration"},"Integration"),Object(a.b)("p",null,"In your consuming project, enable the driver by adding ",Object(a.b)("inlineCode",{parentName:"p"},"eslint")," to your ",Object(a.b)("inlineCode",{parentName:"p"},"drivers")," config."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: ['eslint'],\n};\n\nexport default config;\n")),Object(a.b)("h2",{id:"ignoring-paths"},"Ignoring paths"),Object(a.b)("p",null,"Instead of using an ",Object(a.b)("inlineCode",{parentName:"p"},".eslintignore")," dotfile, you can define an ",Object(a.b)("inlineCode",{parentName:"p"},"ignore")," property in your\nconfiguration module's ",Object(a.b)("inlineCode",{parentName:"p"},"configs/eslint.ts")," file, or a project's ",Object(a.b)("inlineCode",{parentName:"p"},".config/beemo/eslint.ts")," file. This\nproperty accepts an array of strings. For example:"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash",metastring:'title=".eslintignore"',title:'".eslintignore"'},"lib/\n*.min.js\n*.map\n")),Object(a.b)("p",null,"Becomes..."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo/eslint.ts"',title:'".config/beemo/eslint.ts"'},"import { ESLintConfig } from '@beemo/driver-eslint';\n\nconst config: ESLintConfig = {\n  // ...\n  ignore: ['lib/', '*.min.js', '*.map'],\n};\n\nexport default config;\n")),Object(a.b)("p",null,"This feature follows the same configuration lifecycle as ",Object(a.b)("inlineCode",{parentName:"p"},".eslintrc.js"),", with the added benefit of\nconditional logic, and being generated at runtime!"))}p.isMDXComponent=!0}}]);