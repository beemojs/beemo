(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{102:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var r=n(0),i=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=i.a.createContext({}),b=function(e){var t=i.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=b(e.components);return i.a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),u=b(n),d=r,m=u["".concat(l,".").concat(d)]||u[d]||p[d]||a;return n?i.a.createElement(m,o(o({ref:t},s),{},{components:n})):i.a.createElement(m,o({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=d;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return i.a.createElement.apply(null,l)}return i.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},103:function(e,t,n){"use strict";function r(e){var t,n,i="";if("string"==typeof e||"number"==typeof e)i+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=r(e[t]))&&(i&&(i+=" "),i+=n);else for(t in e)e[t]&&(i&&(i+=" "),i+=t);return i}t.a=function(){for(var e,t,n=0,i="";n<arguments.length;)(e=arguments[n++])&&(t=r(e))&&(i&&(i+=" "),i+=t);return i}},104:function(e,t,n){"use strict";var r=n(0),i=n(105);t.a=function(){var e=Object(r.useContext)(i.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},105:function(e,t,n){"use strict";var r=n(0),i=Object(r.createContext)(void 0);t.a=i},106:function(e,t,n){"use strict";var r=n(0),i=n.n(r),a=n(104),l=n(103),o=n(56),c=n.n(o);var s=37,b=39;t.a=function(e){var t=e.lazy,n=e.block,o=e.defaultValue,u=e.values,p=e.groupId,d=e.className,m=Object(a.a)(),f=m.tabGroupChoices,g=m.setTabGroupChoices,y=Object(r.useState)(o),v=y[0],O=y[1],j=r.Children.toArray(e.children),h=[];if(null!=p){var N=f[p];null!=N&&N!==v&&u.some((function(e){return e.value===N}))&&O(N)}var C=function(e){var t=e.target,n=h.indexOf(t),r=j[n].props.value;O(r),null!=p&&(g(p,r),setTimeout((function(){var e,n,r,i,a,l,o,s;(e=t.getBoundingClientRect(),n=e.top,r=e.left,i=e.bottom,a=e.right,l=window,o=l.innerHeight,s=l.innerWidth,n>=0&&a<=s&&i<=o&&r>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(c.a.tabItemActive),setTimeout((function(){return t.classList.remove(c.a.tabItemActive)}),2e3))}),150))},w=function(e){var t,n;switch(e.keyCode){case b:var r=h.indexOf(e.target)+1;n=h[r]||h[0];break;case s:var i=h.indexOf(e.target)-1;n=h[i]||h[h.length-1]}null===(t=n)||void 0===t||t.focus()};return i.a.createElement("div",{className:"tabs-container"},i.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(l.a)("tabs",{"tabs--block":n},d)},u.map((function(e){var t=e.value,n=e.label;return i.a.createElement("li",{role:"tab",tabIndex:v===t?0:-1,"aria-selected":v===t,className:Object(l.a)("tabs__item",c.a.tabItem,{"tabs__item--active":v===t}),key:t,ref:function(e){return h.push(e)},onKeyDown:w,onFocus:C,onClick:C},n)}))),t?Object(r.cloneElement)(j.filter((function(e){return e.props.value===v}))[0],{className:"margin-vert--md"}):i.a.createElement("div",{className:"margin-vert--md"},j.map((function(e,t){return Object(r.cloneElement)(e,{key:t,hidden:e.props.value!==v})}))))}},107:function(e,t,n){"use strict";var r=n(0),i=n.n(r);t.a=function(e){var t=e.children,n=e.hidden,r=e.className;return i.a.createElement("div",{role:"tabpanel",hidden:n,className:r},t)}},90:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return b})),n.d(t,"default",(function(){return p}));var r=n(3),i=n(7),a=(n(0),n(102)),l=n(106),o=n(107),c={title:"Stylelint driver",sidebar_label:"Stylelint"},s={unversionedId:"drivers/stylelint",id:"drivers/stylelint",isDocsHomePage:!1,title:"Stylelint driver",description:"Provides Stylelint support by dynamically generating a .stylelintrc.js",source:"@site/docs/drivers/stylelint.mdx",slug:"/drivers/stylelint",permalink:"/docs/drivers/stylelint",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/drivers/stylelint.mdx",version:"current",sidebar_label:"Stylelint",sidebar:"docs",previous:{title:"Rollup driver",permalink:"/docs/drivers/rollup"},next:{title:"TypeScript driver",permalink:"/docs/drivers/typescript"}},b=[{value:"Requirements",id:"requirements",children:[]},{value:"Events",id:"events",children:[]},{value:"Installation",id:"installation",children:[]},{value:"Integration",id:"integration",children:[]},{value:"Ignoring paths",id:"ignoring-paths",children:[]}],u={toc:b};function p(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Provides ",Object(a.b)("a",{parentName:"p",href:"https://stylelint.io/"},"Stylelint")," support by dynamically generating a ",Object(a.b)("inlineCode",{parentName:"p"},".stylelintrc.js"),"\nconfig file."),Object(a.b)("h2",{id:"requirements"},"Requirements"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"stylelint ^13.0.0")),Object(a.b)("h2",{id:"events"},"Events"),Object(a.b)("p",null,"Can be listened to on the ",Object(a.b)("inlineCode",{parentName:"p"},"StylelintDriver")," instance."),Object(a.b)("table",null,Object(a.b)("thead",{parentName:"table"},Object(a.b)("tr",{parentName:"thead"},Object(a.b)("th",{parentName:"tr",align:null},"Event"),Object(a.b)("th",{parentName:"tr",align:null},"Arguments"),Object(a.b)("th",{parentName:"tr",align:null},"Description"))),Object(a.b)("tbody",{parentName:"table"},Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",{parentName:"tr",align:null},Object(a.b)("inlineCode",{parentName:"td"},"onCreateIgnoreFile")),Object(a.b)("td",{parentName:"tr",align:null},Object(a.b)("inlineCode",{parentName:"td"},"context: ConfigContext, path: Path, config: { ignore: string[] }")),Object(a.b)("td",{parentName:"tr",align:null},"Called before the ignore file is written.")))),Object(a.b)("h2",{id:"installation"},"Installation"),Object(a.b)("p",null,"In your configuration module, install the driver, stylelint, and any plugins."),Object(a.b)(l.a,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},Object(a.b)(o.a,{value:"yarn",mdxType:"TabItem"},Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash"},"yarn add @beemo/driver-stylelint stylelint\n"))),Object(a.b)(o.a,{value:"npm",mdxType:"TabItem"},Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash"},"npm install @beemo/driver-stylelint stylelint\n")))),Object(a.b)("p",null,"Create a file at ",Object(a.b)("inlineCode",{parentName:"p"},"configs/stylelint.ts")," (or ",Object(a.b)("inlineCode",{parentName:"p"},"js"),") in which to house your stylelint configuration."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="configs/stylelint.ts"',title:'"configs/stylelint.ts"'},"import { StylelintConfig } from '@beemo/driver-stylelint';\n\nconst config: StylelintConfig = {\n  rules: {\n    'color-no-invalid-hex': true,\n  },\n  // ...\n};\n\nexport default config;\n")),Object(a.b)("h2",{id:"integration"},"Integration"),Object(a.b)("p",null,"In your consuming project, enable the driver by adding ",Object(a.b)("inlineCode",{parentName:"p"},"stylelint")," to your ",Object(a.b)("inlineCode",{parentName:"p"},"drivers")," config."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: ['stylelint'],\n};\n\nexport default config;\n")),Object(a.b)("h2",{id:"ignoring-paths"},"Ignoring paths"),Object(a.b)("p",null,"Instead of using an ",Object(a.b)("inlineCode",{parentName:"p"},".stylelintignore")," dotfile, you can define an ",Object(a.b)("inlineCode",{parentName:"p"},"ignore")," property in your\nconfiguration module's ",Object(a.b)("inlineCode",{parentName:"p"},"configs/stylelint.ts")," file, or a project's ",Object(a.b)("inlineCode",{parentName:"p"},".config/beemo/stylelint.ts"),"\nfile. This property accepts an array of strings. For example:"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-bash",metastring:'title=".stylelintignore"',title:'".stylelintignore"'},"lib/\n*.min.js\n*.map\n")),Object(a.b)("p",null,"Becomes..."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo/stylelint.ts"',title:'".config/beemo/stylelint.ts"'},"import { StylelintConfig } from '@beemo/driver-stylelint';\n\nconst config: StylelintConfig = {\n  // ...\n  ignore: ['lib/', '*.min.js', '*.map'],\n};\n\nexport default config;\n")),Object(a.b)("p",null,"This feature follows the same configuration lifecycle as ",Object(a.b)("inlineCode",{parentName:"p"},".stylelintrc.js"),", with the added benefit\nof conditional logic, and being generated at runtime!"))}p.isMDXComponent=!0}}]);