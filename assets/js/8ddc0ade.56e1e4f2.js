(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[797],{5318:function(e,t,n){"use strict";n.d(t,{Zo:function(){return u},kt:function(){return d}});var a=n(7378);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=p(n),d=i,f=c["".concat(s,".").concat(d)]||c[d]||m[d]||r;return n?a.createElement(f,o(o({ref:t},u),{},{components:n})):a.createElement(f,o({ref:t},u))}));function d(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},517:function(e,t,n){"use strict";var a=n(7378);t.Z=function(e){var t=e.children,n=e.hidden,i=e.className;return a.createElement("div",{role:"tabpanel",hidden:n,className:i},t)}},6359:function(e,t,n){"use strict";n.d(t,{Z:function(){return u}});var a=n(7378),i=n(4309),r=n(8944),o="tabItem_c0e5",l="tabItemActive_28AG";var s=37,p=39;var u=function(e){var t=e.lazy,n=e.block,u=e.defaultValue,m=e.values,c=e.groupId,d=e.className,f=(0,i.Z)(),g=f.tabGroupChoices,k=f.setTabGroupChoices,h=(0,a.useState)(u),b=h[0],v=h[1],N=a.Children.toArray(e.children),y=[];if(null!=c){var C=g[c];null!=C&&C!==b&&m.some((function(e){return e.value===C}))&&v(C)}var w=function(e){var t=e.currentTarget,n=y.indexOf(t),a=m[n].value;v(a),null!=c&&(k(c,a),setTimeout((function(){var e,n,a,i,r,o,s,p;(e=t.getBoundingClientRect(),n=e.top,a=e.left,i=e.bottom,r=e.right,o=window,s=o.innerHeight,p=o.innerWidth,n>=0&&r<=p&&i<=s&&a>=0)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(l),setTimeout((function(){return t.classList.remove(l)}),2e3))}),150))},j=function(e){var t,n;switch(e.keyCode){case p:var a=y.indexOf(e.target)+1;n=y[a]||y[0];break;case s:var i=y.indexOf(e.target)-1;n=y[i]||y[y.length-1]}null==(t=n)||t.focus()};return a.createElement("div",{className:"tabs-container"},a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.Z)("tabs",{"tabs--block":n},d)},m.map((function(e){var t=e.value,n=e.label;return a.createElement("li",{role:"tab",tabIndex:b===t?0:-1,"aria-selected":b===t,className:(0,r.Z)("tabs__item",o,{"tabs__item--active":b===t}),key:t,ref:function(e){return y.push(e)},onKeyDown:j,onFocus:w,onClick:w},n)}))),t?(0,a.cloneElement)(N.filter((function(e){return e.props.value===b}))[0],{className:"margin-vert--md"}):a.createElement("div",{className:"margin-vert--md"},N.map((function(e,t){return(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==b})}))))}},4956:function(e,t,n){"use strict";var a=(0,n(7378).createContext)(void 0);t.Z=a},4309:function(e,t,n){"use strict";var a=n(7378),i=n(4956);t.Z=function(){var e=(0,a.useContext)(i.Z);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},7886:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return s},metadata:function(){return p},toc:function(){return u},default:function(){return c}});var a=n(9603),i=n(120),r=(n(7378),n(5318)),o=n(6359),l=n(517),s={title:"Consumer setup"},p={unversionedId:"consumer",id:"consumer",isDocsHomePage:!1,title:"Consumer setup",description:"Now that you have a configuration module, we can integrate it downstream into a project. But first,",source:"@site/docs/consumer.mdx",sourceDirName:".",slug:"/consumer",permalink:"/docs/consumer",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/consumer.mdx",version:"current",frontMatter:{title:"Consumer setup"},sidebar:"docs",previous:{title:"Provider setup",permalink:"/docs/provider"},next:{title:"Driver usage",permalink:"/docs/driver"}},u=[{value:"Settings",id:"settings",children:[]},{value:"Using drivers",id:"using-drivers",children:[{value:"Options",id:"options",children:[]}]},{value:"Executing drivers",id:"executing-drivers",children:[{value:"CLI options",id:"cli-options",children:[]},{value:"Watch mode",id:"watch-mode",children:[]},{value:"Live mode",id:"live-mode",children:[]}]},{value:"Executing scripts",id:"executing-scripts",children:[]},{value:"Creating config files",id:"creating-config-files",children:[]},{value:"Overriding configs",id:"overriding-configs",children:[]},{value:"Custom configs with templates",id:"custom-configs-with-templates",children:[]}],m={toc:u};function c(e){var t=e.components,n=(0,i.Z)(e,["components"]);return(0,r.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Now that you have a configuration module, we can integrate it downstream into a project. But first,\ngo ahead and delete all the old config files and dependencies in each project (if they exist), as\nall that logic should now be housed in your configuration module."),(0,r.kt)("p",null,"Once you have a clean slate, install your configuration module, and BOOM, it's as easy as that. No\nmore development dependency hell, just a single dependency."),(0,r.kt)(o.Z,{groupId:"package-manager",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"NPM",value:"npm"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"yarn",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add <config-module> --dev\n"))),(0,r.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"npm install <config-module> --save-dev\n")))),(0,r.kt)("p",null,"With that being said, create a ",(0,r.kt)("inlineCode",{parentName:"p"},".config/beemo.ts")," file (or ",(0,r.kt)("inlineCode",{parentName:"p"},".js"),", ",(0,r.kt)("inlineCode",{parentName:"p"},".json"),", ",(0,r.kt)("inlineCode",{parentName:"p"},".yaml"),") in your project\nroot with a ",(0,r.kt)("inlineCode",{parentName:"p"},"module")," property that matches the name of your configuration module, or another\nthird-party module (if you don't want to manage your own provider)."),(0,r.kt)(o.Z,{groupId:"format",defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"},{label:"JSON",value:"json"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"ts",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n};\n\nexport default config;\n"))),(0,r.kt)(l.Z,{value:"js",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title=".config/beemo.js"',title:'".config/beemo.js"'},"module.exports = {\n  module: '<config-module>',\n};\n"))),(0,r.kt)(l.Z,{value:"json",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json",metastring:'title=".config/beemo.json"',title:'".config/beemo.json"'},'{\n  "module": "<config-module>"\n}\n')))),(0,r.kt)("h3",{id:"settings"},"Settings"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"module")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string"),") - Name of your configuration module."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"configure.cleanup")," (",(0,r.kt)("inlineCode",{parentName:"li"},"boolean"),") - Remove generated config files after execution. Defaults to\n",(0,r.kt)("inlineCode",{parentName:"li"},"false"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"configure.parallel")," (",(0,r.kt)("inlineCode",{parentName:"li"},"boolean"),") - Create configuration files in parallel. Defaults to ",(0,r.kt)("inlineCode",{parentName:"li"},"true"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"execute.concurrency")," (",(0,r.kt)("inlineCode",{parentName:"li"},"number"),") - Number of builds to run in parallel. Defaults to the number of\nCPUs."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"execute.graph")," (",(0,r.kt)("inlineCode",{parentName:"li"},"boolean"),") - Prioritize workspace builds based on\n",(0,r.kt)("a",{parentName:"li",href:"/docs/workspaces#priority-packages"},"dependency graph"),". Defaults to ",(0,r.kt)("inlineCode",{parentName:"li"},"true"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"drivers")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string[] | object"),") - Drivers to enable for the consumer."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"scripts")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string[] | object"),") - Scripts to enable for the consumer."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"settings")," (",(0,r.kt)("inlineCode",{parentName:"li"},"object"),") - Custom settings specific to your project that can easily be referenced.")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Periods denote nested objects.")),(0,r.kt)("h2",{id:"using-drivers"},"Using drivers"),(0,r.kt)("p",null,"Driver dependencies may have been installed in your configuration module, but that does not make\nthem available to the current project, as not all drivers will always be necessary. To enable\ndrivers per project, a ",(0,r.kt)("inlineCode",{parentName:"p"},"drivers")," property must be defined."),(0,r.kt)("p",null,"This property accepts an array of strings/tuples or objects, with the names of each driver you want\nto enable. For example, if we want to use Babel, ESLint, and Jest, we would have the following."),(0,r.kt)(o.Z,{groupId:"format",defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"ts",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: [\n    'babel',\n    'eslint',\n    [\n      'jest',\n      {\n        env: { NODE_ENV: 'test' },\n      },\n    ],\n  ],\n};\n\nexport default config;\n"))),(0,r.kt)(l.Z,{value:"js",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title=".config/beemo.js"',title:'".config/beemo.js"'},"module.exports = {\n  module: '<config-module>',\n  drivers: [\n    'babel',\n    'eslint',\n    [\n      'jest',\n      {\n        env: { NODE_ENV: 'test' },\n      },\n    ],\n  ],\n};\n")))),(0,r.kt)("p",null,"Furthermore, drivers can be configured with options by using an object. If a driver does not require\noptions, either pass an empty object, or a boolean ",(0,r.kt)("inlineCode",{parentName:"p"},"true"),"."),(0,r.kt)(o.Z,{groupId:"format",defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"ts",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: {\n    babel: true,\n    eslint: {\n      args: ['--color', '--report-unused-disable-directives'],\n    },\n    jest: {\n      env: { NODE_ENV: 'test' },\n    },\n  },\n};\n\nexport default config;\n"))),(0,r.kt)(l.Z,{value:"js",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title=".config/beemo.js"',title:'".config/beemo.js"'},"module.exports = {\n  module: '<config-module>',\n  drivers: {\n    babel: true,\n    eslint: {\n      args: ['--color', '--report-unused-disable-directives'],\n    },\n    jest: {\n      env: { NODE_ENV: 'test' },\n    },\n  },\n};\n")))),(0,r.kt)("p",null,"Options can also be set through the ",(0,r.kt)("a",{parentName:"p",href:"/docs/events"},"bootstrap and event system"),"."),(0,r.kt)("h3",{id:"options"},"Options"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"args")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string[]"),") - Arguments to always pass when executing the driver binary."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"dependencies")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string[]"),") - Other drivers that are required for this driver to run."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"env")," (",(0,r.kt)("inlineCode",{parentName:"li"},"object"),") - Environment variables to pass when executing the driver binary with\n",(0,r.kt)("a",{parentName:"li",href:"https://github.com/sindresorhus/execa"},"execa"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"expandGlobs")," (",(0,r.kt)("inlineCode",{parentName:"li"},"boolean"),") - Controls whether or not glob patterns in args are automatically\nexpanded before being passed to the driver binary. Defaults to ",(0,r.kt)("inlineCode",{parentName:"li"},"true"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"strategy")," (",(0,r.kt)("inlineCode",{parentName:"li"},"create | copy | reference | template | native | none"),") - Type of\n",(0,r.kt)("a",{parentName:"li",href:"/docs/driver#config-strategies"},"strategy")," to use when generating a config file. Default is\ndifferent per driver."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"template")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string"),") - File path to a template function for generating custom config files and\npaths. Is required when ",(0,r.kt)("inlineCode",{parentName:"li"},"strategy"),' is "template".')),(0,r.kt)("h2",{id:"executing-drivers"},"Executing drivers"),(0,r.kt)("p",null,"Now for the fun part, executing the driver! It's as simple as ",(0,r.kt)("inlineCode",{parentName:"p"},"yarn beemo <driver>")," (or\n",(0,r.kt)("inlineCode",{parentName:"p"},"npx beemo <driver>"),"). Once entered, this will initialize Beemo's pipeline, generate a configuration\nfile, execute the underlying driver binary, handle stdout and stderr output, cleanup after itself,\nand lastly, leave a beautiful message in your console."),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"All arguments passed to Beemo are passed to the driver's underlying binary.")),(0,r.kt)("p",null,"That being said, consistently remembering the correct commands and arguments to pass to ",(0,r.kt)("inlineCode",{parentName:"p"},"yarn")," and\n",(0,r.kt)("inlineCode",{parentName:"p"},"npx")," is tedious. So why not use scripts? Feel free to steal the following."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="package.json"',title:'"package.json"'},'{\n  "scripts": {\n    "build": "beemo babel ./src --out-dir ./lib",\n    "lint": "beemo eslint ./src ./tests",\n    "test": "beemo jest",\n    "format": "beemo prettier --write \\"./{src,tests}/**/*.{js,json,md}\\"",\n    "type": "beemo typescript"\n  }\n}\n')),(0,r.kt)("h3",{id:"cli-options"},"CLI options"),(0,r.kt)("p",null,"The following options are available when executing a driver."),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"--concurrency")," (",(0,r.kt)("inlineCode",{parentName:"li"},"number"),") - Number of builds to run in parallel. Defaults to the amount of CPUs."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"--[no-]graph")," (",(0,r.kt)("inlineCode",{parentName:"li"},"bool"),") - Prioritize workspace builds based on\n",(0,r.kt)("a",{parentName:"li",href:"/docs/workspaces#priority-packages"},"dependency graph"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"--stdio")," (",(0,r.kt)("inlineCode",{parentName:"li"},"buffer | inherit | stream"),') - Control how the underlying driver output is displayed in\nthe console. Defaults to "buffer".',(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"buffer")," - Renders Beemo output using the defined reporter(s). Underlying driver output will be\nrendered on success or failure."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"inherit")," - Doesn't render Beemo output and instead streams the underlying driver output live."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"stream")," - A combination of ",(0,r.kt)("inlineCode",{parentName:"li"},"buffer")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"inherit"),"."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"--workspaces")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string"),") - Execute the command in each ",(0,r.kt)("a",{parentName:"li",href:"/docs/workspaces"},"workspace")," defined by\nthe pattern/value. Pass ",(0,r.kt)("inlineCode",{parentName:"li"},"*")," to run in all workspaces.")),(0,r.kt)("h3",{id:"watch-mode"},"Watch mode"),(0,r.kt)("p",null,"If the underlying driver supports file watching, most commonly through a CLI option like ",(0,r.kt)("inlineCode",{parentName:"p"},"-w")," or\n",(0,r.kt)("inlineCode",{parentName:"p"},"--watch"),", Beemo will attempt to capture and pipe this output to your terminal."),(0,r.kt)("h3",{id:"live-mode"},"Live mode"),(0,r.kt)("p",null,"The Beemo console masks output of the underlying driver while it is executing. If you prefer to see\nthe driver output live, simply pass ",(0,r.kt)("inlineCode",{parentName:"p"},"--stdio=stream")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"--stdio=inherit"),"."),(0,r.kt)("h2",{id:"executing-scripts"},"Executing scripts"),(0,r.kt)("p",null,"A script within your configuration module can be executed using ",(0,r.kt)("inlineCode",{parentName:"p"},"yarn beemo run-script <name>")," (or\n",(0,r.kt)("inlineCode",{parentName:"p"},"npx beemo run-script <name>"),"). The name of the script should be passed in kebab-case."),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"All arguments passed to Beemo are passed to the script's ",(0,r.kt)("inlineCode",{parentName:"p"},"run()")," method.")),(0,r.kt)("h2",{id:"creating-config-files"},"Creating config files"),(0,r.kt)("p",null,"Executing a driver will dynamically create a configuration file at runtime. If you'd like to create\nthe config manually outside of executing a driver, you can use the ",(0,r.kt)("inlineCode",{parentName:"p"},"yarn beemo create-config")," (or\n",(0,r.kt)("inlineCode",{parentName:"p"},"npx beemo create-config"),")."),(0,r.kt)("p",null,"When no arguments are passed, it will create a config file for all enabled drivers (found in the\n",(0,r.kt)("inlineCode",{parentName:"p"},"drivers")," setting). Otherwise, a config file will be created for each driver name passed as an\nargument."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"// All drivers\nyarn beemo create-config\n\n// Only Babel and Jest\nyarn beemo create-config babel jest\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"If a driver has a dependency on another driver, it will create a config file for the dependency as\nwell.")),(0,r.kt)("h2",{id:"overriding-configs"},"Overriding configs"),(0,r.kt)("p",null,"Your configuration module may now house and provide all configurations, but that doesn't mean it's\napplicable to ",(0,r.kt)("em",{parentName:"p"},"all")," consuming projects. To accomodate this, Beemo supports overriding of driver\nconfig on a project-by-project basis through a local ",(0,r.kt)("inlineCode",{parentName:"p"},".config/beemo/<driver>.(js|ts)")," file."),(0,r.kt)(o.Z,{groupId:"format",defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"ts",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo/eslint.ts"',title:'".config/beemo/eslint.ts"'},"import { ESLintConfig } from '@beemo/driver-eslint';\n\nconst config: ESLintConfig = {\n  rules: {\n    'no-param-reassign': 0,\n  },\n};\n\nexport default config;\n"))),(0,r.kt)(l.Z,{value:"js",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title=".config/beemo/eslint.js"',title:'".config/beemo/eslint.js"'},"module.exports = {\n  rules: {\n    'no-param-reassign': 0,\n  },\n};\n")))),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Some dev tools support ",(0,r.kt)("inlineCode",{parentName:"p"},"package.json")," overrides like this, but it's preferred to use the Beemo\napproach for interoperability.")),(0,r.kt)("h2",{id:"custom-configs-with-templates"},"Custom configs with templates"),(0,r.kt)("p",null,"Beemo provides sane defaults for all official drivers and attempts to standardize the configuration\nprocess as much as possible. However, it's not perfect, and may not work for all consumers. To\nmitigate this problem, each driver supports a template based strategy, in which a custom template\nfunction can be used to handle the config generation (custom merging, etc), and the destination file\npath."),(0,r.kt)("p",null,"To use templates, set the driver ",(0,r.kt)("inlineCode",{parentName:"p"},"strategy"),' option to "template", and the ',(0,r.kt)("inlineCode",{parentName:"p"},"template")," option to a\nfile path for the template function (relative to the ",(0,r.kt)("inlineCode",{parentName:"p"},".config")," folder)."),(0,r.kt)(o.Z,{groupId:"format",defaultValue:"ts",values:[{label:"TypeScript",value:"ts"},{label:"JavaScript",value:"js"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"ts",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"import { BeemoConfig } from '@beemo/core';\n\nconst config: BeemoConfig = {\n  module: '<config-module>',\n  drivers: [\n    [\n      'eslint',\n      {\n        strategy: 'template',\n        template: './path/to/custom/template.ts',\n      },\n    ],\n  ],\n};\n\nexport default config;\n"))),(0,r.kt)(l.Z,{value:"js",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title=".config/beemo.js"',title:'".config/beemo.js"'},"module.exports = {\n  module: '<config-module>',\n  drivers: [\n    [\n      'eslint',\n      {\n        strategy: 'template',\n        template: './path/to/custom/template.ts',\n      },\n    ],\n  ],\n};\n")))),(0,r.kt)("p",null,"The template is merely a function that receives a list of config objects from multiple sources, and\nmust return a single config object (or string), and an optional destination path. It also receives\nan options object with helpful information about the current process."),(0,r.kt)("p",null,"To demonstrate the power of templates, let's write a custom template that generates a YAML\nconfiguration file for ESLint."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="./path/to/custom/template.ts"',title:'"./path/to/custom/template.ts"'},"import { yaml } from '@boost/common';\nimport { ConfigObject, ConfigTemplateResult, ConfigTemplateOptions } from '@beemo/core';\n\nexport default function customTemplate(\n  configs: ConfigObject[],\n  options: ConfigTemplateOptions,\n): ConfigTemplateResult {\n  // Manually merge the list of configs into a single config object\n  // using the rules of the driver, or ones unique to your project.\n  const config = mergeConfigs(configs);\n\n  // A template must return a `config` property, which can be an object\n  // that will be formatted as JSON/JS, or a string which will be written as-is.\n  // It can also return an optional `path` property, allowing the destination\n  // config file path to be customized.\n  return {\n    config: yaml.stringify(config),\n    path: options.context.cwd.append('.eslintrc.yaml'),\n  };\n}\n")),(0,r.kt)("p",null,"The list of available options are:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"configModule")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string"),") - Name of the configuration module."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"consumerConfigPath")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Path | null"),") - Path to the driver's config file in the configuration\nmodule. For example, ",(0,r.kt)("inlineCode",{parentName:"li"},"configs/eslint.ts"),". Is ",(0,r.kt)("inlineCode",{parentName:"li"},"null")," if not found."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"context")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Context"),") - Current pipeline context."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"driver")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Driver"),") - Current instance for the driver being processed."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"driverConfigPath")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Path"),") - Path to the driver's default config file destination. For example,\n",(0,r.kt)("inlineCode",{parentName:"li"},".eslintrc.js")," in the root."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"driverName")," (",(0,r.kt)("inlineCode",{parentName:"li"},"string"),") - Name of the driver being processed. For example, ",(0,r.kt)("inlineCode",{parentName:"li"},"eslint"),"."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"providerConfigPath")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Path | null"),") - Path to the driver's config file in the current project.\nFor example, ",(0,r.kt)("inlineCode",{parentName:"li"},".config/beemo/eslint.ts"),". Is ",(0,r.kt)("inlineCode",{parentName:"li"},"null")," if not found."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"templatePath")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Path"),") - Path to the template file (itself)."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"tool")," (",(0,r.kt)("inlineCode",{parentName:"li"},"Tool"),") - Current ",(0,r.kt)("a",{parentName:"li",href:"/docs/tool"},"tool instance"),".")))}c.isMDXComponent=!0},8944:function(e,t,n){"use strict";function a(e){var t,n,i="";if("string"==typeof e||"number"==typeof e)i+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=a(e[t]))&&(i&&(i+=" "),i+=n);else for(t in e)e[t]&&(i&&(i+=" "),i+=t);return i}function i(){for(var e,t,n=0,i="";n<arguments.length;)(e=arguments[n++])&&(t=a(e))&&(i&&(i+=" "),i+=t);return i}n.d(t,{Z:function(){return i}})}}]);