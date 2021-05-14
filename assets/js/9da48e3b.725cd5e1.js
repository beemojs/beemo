(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[594],{5318:function(e,n,t){"use strict";t.d(n,{Zo:function(){return d},kt:function(){return u}});var r=t(7378);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=r.createContext({}),p=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},d=function(e){var n=p(e.components);return r.createElement(l.Provider,{value:n},e.children)},c={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),m=p(t),u=a,g=m["".concat(l,".").concat(u)]||m[u]||c[u]||o;return t?r.createElement(g,i(i({ref:n},d),{},{components:t})):r.createElement(g,i({ref:n},d))}));function u(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=m;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},7634:function(e,n,t){"use strict";t.r(n),t.d(n,{frontMatter:function(){return i},metadata:function(){return s},toc:function(){return l},default:function(){return d}});var r=t(9603),a=t(120),o=(t(7378),t(5318)),i={title:"Migrate to v2.0",sidebar_label:"2.0"},s={unversionedId:"migration/2.0",id:"migration/2.0",isDocsHomePage:!1,title:"Migrate to v2.0",description:"Configuration",source:"@site/docs/migration/2.0.md",sourceDirName:"migration",slug:"/migration/2.0",permalink:"/docs/migration/2.0",editUrl:"https://github.com/beemojs/beemo/edit/master/website/docs/migration/2.0.md",version:"current",sidebar_label:"2.0",frontMatter:{title:"Migrate to v2.0",sidebar_label:"2.0"},sidebar:"docs",previous:{title:"Advanced",permalink:"/docs/advanced"}},l=[{value:"Configuration",id:"configuration",children:[{value:"Beemo configuration has moved",id:"beemo-configuration-has-moved",children:[]},{value:"Driver overrides have been removed from <code>package.json</code>",id:"driver-overrides-have-been-removed-from-packagejson",children:[]},{value:"Drivers configuration structure has changed",id:"drivers-configuration-structure-has-changed",children:[]}]},{value:"Beemo",id:"beemo",children:[{value:"File and type have moved",id:"file-and-type-have-moved",children:[]},{value:"Logging has been removed",id:"logging-has-been-removed",children:[]},{value:"Workspace methods have moved",id:"workspace-methods-have-moved",children:[]},{value:"Driver and script management has changed",id:"driver-and-script-management-has-changed",children:[]},{value:"Driver and script modules must export a factory function and have a name property",id:"driver-and-script-modules-must-export-a-factory-function-and-have-a-name-property",children:[]}]},{value:"Contexts",id:"contexts",children:[{value:"Options are now located in multiple locations",id:"options-are-now-located-in-multiple-locations",children:[]},{value:"Positional args are now referred to as params",id:"positional-args-are-now-referred-to-as-params",children:[]}]},{value:"Drivers",id:"drivers",children:[{value:"Jest: Peer dependency on Babel has been removed",id:"jest-peer-dependency-on-babel-has-been-removed",children:[]},{value:"TypeScript: The <code>--reference-workspaces</code> option has been removed",id:"typescript-the---reference-workspaces-option-has-been-removed",children:[]},{value:"TypeScript: Package project reference linking has moved to a new command",id:"typescript-package-project-reference-linking-has-moved-to-a-new-command",children:[]}]},{value:"Scripts",id:"scripts",children:[{value:"Script arguments are now based on <code>@boost/args</code>",id:"script-arguments-are-now-based-on-boostargs",children:[]},{value:"Script tasks have been removed",id:"script-tasks-have-been-removed",children:[]}]},{value:"TypeScript",id:"typescript",children:[]}],p={toc:l};function d(e){var n=e.components,t=(0,a.Z)(e,["components"]);return(0,o.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"configuration"},"Configuration"),(0,o.kt)("h3",{id:"beemo-configuration-has-moved"},"Beemo configuration has moved"),(0,o.kt)("p",null,"Previously, configuration was either defined in a root ",(0,o.kt)("inlineCode",{parentName:"p"},"configs/beemo.js")," file, or a ",(0,o.kt)("inlineCode",{parentName:"p"},"beemo")," block\nwithin ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json"),". Configuration must now be defined in ",(0,o.kt)("inlineCode",{parentName:"p"},".config/beemo.ts")," (or ",(0,o.kt)("inlineCode",{parentName:"p"},".js"),", ",(0,o.kt)("inlineCode",{parentName:"p"},".json"),",\n",(0,o.kt)("inlineCode",{parentName:"p"},".yaml"),", etc). Package level config has been removed entirely."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"export default {\n  module: '<config-module>',\n};\n")),(0,o.kt)("h3",{id:"driver-overrides-have-been-removed-from-packagejson"},"Driver overrides have been removed from ",(0,o.kt)("inlineCode",{parentName:"h3"},"package.json")),(0,o.kt)("p",null,"The ability to configure drivers in a ",(0,o.kt)("inlineCode",{parentName:"p"},"beemo.<driver>")," block within ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json")," has been removed.\nInstead, configure the driver at ",(0,o.kt)("inlineCode",{parentName:"p"},".config/beemo/<driver>.ts")," (or ",(0,o.kt)("inlineCode",{parentName:"p"},".js"),")."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="package.json"',title:'"package.json"'},'// Before\n{\n  "beemo": {\n    "eslint": {\n      "rules": {\n        "no-console": "off"\n      }\n    }\n  }\n}\n')),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo/eslint.ts"',title:'".config/beemo/eslint.ts"'},"// After\nimport { ESLintConfig } from '@beemo/driver-eslint';\n\nconst config: ESLintConfig = {\n  rules: {\n    'no-console': 'off',\n  },\n};\n\nexport default config;\n")),(0,o.kt)("h3",{id:"drivers-configuration-structure-has-changed"},"Drivers configuration structure has changed"),(0,o.kt)("p",null,"When configuring drivers with the ",(0,o.kt)("inlineCode",{parentName:"p"},"drivers")," setting, either supply a list of names."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"export default {\n  module: '<config-module>',\n  drivers: ['babel', 'jest'],\n};\n")),(0,o.kt)("p",null,"Or a tuple with a name and an options object."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"export default {\n  module: '<config-module>',\n  drivers: [\n    'babel',\n    [\n      'jest',\n      {\n        env: {\n          NODE_ENV: 'test',\n        },\n      },\n    ],\n  ],\n};\n")),(0,o.kt)("p",null,"Or if you need more control, an object of names that map to booleans (enable or disable the driver),\nor an options object."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title=".config/beemo.ts"',title:'".config/beemo.ts"'},"export default {\n  module: '<config-module>',\n  drivers: {\n    babel: true,\n    jest: {\n      env: {\n        NODE_ENV: 'test',\n      },\n    },\n  },\n};\n")),(0,o.kt)("p",null,"The old format of mixing strings and objects within a list is no longer supported. For more\ninformation on these formats,\n",(0,o.kt)("a",{parentName:"p",href:"https://boostlib.dev/docs/plugin#configuration-files"},"check out the official Boost documentation on plugins"),"."),(0,o.kt)("h2",{id:"beemo"},"Beemo"),(0,o.kt)("h3",{id:"file-and-type-have-moved"},"File and type have moved"),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"Beemo")," class instance is no longer default exported from ",(0,o.kt)("inlineCode",{parentName:"p"},"@beemo/core"),". It can now be accessed\nfrom the named ",(0,o.kt)("inlineCode",{parentName:"p"},"Tool")," class export, or the ",(0,o.kt)("inlineCode",{parentName:"p"},"BeemoTool")," type alias export."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nimport Beemo from '@beemo/core';\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\nimport { Tool } from '@beemo/core';\n")),(0,o.kt)("h3",{id:"logging-has-been-removed"},"Logging has been removed"),(0,o.kt)("p",null,"All logging methods have been removed. Use the native ",(0,o.kt)("inlineCode",{parentName:"p"},"console")," instead."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nbeemo.log();\nbeemo.log.error();\nbeemo.console.log();\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\nconsole.log();\nconsole.error();\n")),(0,o.kt)("h3",{id:"workspace-methods-have-moved"},"Workspace methods have moved"),(0,o.kt)("p",null,"Methods relating to project workspaces have moved to the ",(0,o.kt)("inlineCode",{parentName:"p"},"project")," class property. The APIs of these\nmethods may have also changed, so please refer to their TypeScript types."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nbeemo.getWorkspacePaths();\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\ntool.project.getWorkspacePaths();\n")),(0,o.kt)("h3",{id:"driver-and-script-management-has-changed"},"Driver and script management has changed"),(0,o.kt)("p",null,"Drivers and scripts have moved to a registry based pattern, resulting in changes to the ",(0,o.kt)("inlineCode",{parentName:"p"},"Tool")," API."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nbeemo.getPlugin('script', 'build');\nbeemo.getPlugin('driver', 'babel');\nbeemo.isPluginEnabled('driver', 'typescript');\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\ntool.scriptRegistry.get('build');\ntool.driverRegistry.get('babel');\ntool.driverRegistry.isRegistered('typescript');\n")),(0,o.kt)("h3",{id:"driver-and-script-modules-must-export-a-factory-function-and-have-a-name-property"},"Driver and script modules must export a factory function and have a name property"),(0,o.kt)("p",null,"If you're using custom driver and script modules, they must now default export a function that\nreturns a class instance, instead of exporting a class declaration. Furthermore, all driver and\nscript instances must have a ",(0,o.kt)("inlineCode",{parentName:"p"},"name")," property (which is the name of the NPM module)."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nexport default class CustomDriver extends Driver<CustomConfig, CustomOptions> {}\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\nclass CustomDriver extends Driver<CustomConfig, CustomOptions> {\n  readonly name = 'npm-module-name-driver';\n}\n\nexport default (options: CustomOptions) => new CustomDriver(options);\n")),(0,o.kt)("h2",{id:"contexts"},"Contexts"),(0,o.kt)("p",null,"With the migration from ",(0,o.kt)("inlineCode",{parentName:"p"},"yargs")," to ",(0,o.kt)("a",{parentName:"p",href:"https://boostlib.dev/docs/args"},"@boost/args"),", the args object\nstructure has changed, as well as any terminology."),(0,o.kt)("h3",{id:"options-are-now-located-in-multiple-locations"},"Options are now located in multiple locations"),(0,o.kt)("p",null,"Options are either known or unknown, depending on the CLI command being ran. Known options are now\naccessed from ",(0,o.kt)("inlineCode",{parentName:"p"},"args.options"),", while unknown options from ",(0,o.kt)("inlineCode",{parentName:"p"},"args.unknown"),". Since unknown options are\nwell, unknown, we have no information on what type of value they should be, so all unknown option\nvalues are ",(0,o.kt)("em",{parentName:"p"},"always")," strings."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\ncontext.args.clean;\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\ncontext.args.options.clean;\ncontext.args.unknown.clean;\n")),(0,o.kt)("p",null,"To avoid having to check both of these locations, a new ",(0,o.kt)("inlineCode",{parentName:"p"},"Context#getRiskyOption()")," method has been\nprovided. It will return the known option if it exists, otherwise unknown, and ",(0,o.kt)("inlineCode",{parentName:"p"},"null")," if neither\nexists."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"context.getRiskyOption('clean');\n")),(0,o.kt)("p",null,"However, this method is risky, as denoted by its name. For unknown options, empty string values are\nconverted to ",(0,o.kt)("inlineCode",{parentName:"p"},"true"),", as they are treated as flags (",(0,o.kt)("inlineCode",{parentName:"p"},"--clean"),"). If you want to avoid the conversion,\npass ",(0,o.kt)("inlineCode",{parentName:"p"},"true")," as a 2nd argument."),(0,o.kt)("h3",{id:"positional-args-are-now-referred-to-as-params"},"Positional args are now referred to as params"),(0,o.kt)("p",null,"The title is self-explanatory. Args are now called params, and the argv list is now accessed from\n",(0,o.kt)("inlineCode",{parentName:"p"},"args.params")," instead of ",(0,o.kt)("inlineCode",{parentName:"p"},"args._"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\ncontext.args._;\ncontext.addArg('./src');\ncontext.addArgs(['foo', 'bar']);\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\ncontext.args.params;\ncontext.addParam('./src');\ncontext.addParams(['foo', 'bar']);\n")),(0,o.kt)("h2",{id:"drivers"},"Drivers"),(0,o.kt)("h3",{id:"jest-peer-dependency-on-babel-has-been-removed"},"Jest: Peer dependency on Babel has been removed"),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"@beemo/driver-babel")," peer dependency has been removed from the Jest driver's ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json"),",\nbut the Babel config will still be automatically generated when running Jest if the Babel driver has\nbeen enabled."),(0,o.kt)("p",null,"If you're using Babel to transform files within your Jest tests, be sure to install both driver\ndependencies manually."),(0,o.kt)("h3",{id:"typescript-the---reference-workspaces-option-has-been-removed"},"TypeScript: The ",(0,o.kt)("inlineCode",{parentName:"h3"},"--reference-workspaces")," option has been removed"),(0,o.kt)("p",null,"In previous versions, the ",(0,o.kt)("inlineCode",{parentName:"p"},"--reference-workspaces")," CLI option would automatically generate project\nreferences in the root ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json"),", and a ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," in each package folder. Going forward,\nroot project references will now be linked automatically if a project is workspaces enabled (Yarn\nworkspaces, etc) instead of requiring a CLI option."),(0,o.kt)("h3",{id:"typescript-package-project-reference-linking-has-moved-to-a-new-command"},"TypeScript: Package project reference linking has moved to a new command"),(0,o.kt)("p",null,"As mentioned above, project references were automatically linked when running the TypeScript driver\nwith ",(0,o.kt)("inlineCode",{parentName:"p"},"--reference-workspaces"),". However, this process was rather heavy and only needed to be ran when\nadding or removing packages, or changing dependencies. Because of this, package-level project\nreference linking has moved to a new command, ",(0,o.kt)("inlineCode",{parentName:"p"},"beemo typescript:sync-project-refs"),"."),(0,o.kt)("p",null,"This new command will only update the ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," within each package, as the root\n",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," is still updated when running ",(0,o.kt)("inlineCode",{parentName:"p"},"beemo typescript"),"."),(0,o.kt)("h2",{id:"scripts"},"Scripts"),(0,o.kt)("h3",{id:"script-arguments-are-now-based-on-boostargs"},"Script arguments are now based on ",(0,o.kt)("inlineCode",{parentName:"h3"},"@boost/args")),(0,o.kt)("p",null,"To support the new functionality provided by ",(0,o.kt)("a",{parentName:"p",href:"https://boostlib.dev/docs/args#parsing"},"@boost/args"),",\nthe ",(0,o.kt)("inlineCode",{parentName:"p"},"args()")," method has been renamed to ",(0,o.kt)("inlineCode",{parentName:"p"},"parse()"),", and the return type/structure has changed to\n",(0,o.kt)("inlineCode",{parentName:"p"},"ParserOptions"),". Furthermore, the 2nd argument to ",(0,o.kt)("inlineCode",{parentName:"p"},"execute()")," has updated to the type/structure of\n",(0,o.kt)("inlineCode",{parentName:"p"},"Arguments"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Before\nclass BuildScript extends Script {\n  args() {\n    return {\n      string: ['workspaces'],\n      default: {\n        workspaces: '',\n      },\n    };\n  }\n}\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// After\nclass BuildScript extends Script {\n  parse() {\n    return {\n      options: {\n        workspaces: {\n          description: 'Glob pattern to find workspaces',\n          type: 'string',\n        },\n      },\n    };\n  }\n}\n")),(0,o.kt)("h3",{id:"script-tasks-have-been-removed"},"Script tasks have been removed"),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"executeTasks()")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"task()")," methods have been removed. If you would like similar\nfunctionality, we suggest using the ",(0,o.kt)("a",{parentName:"p",href:"https://boostlib.dev/docs/pipeline"},"@boost/pipeline")," package\ndirectly."),(0,o.kt)("h2",{id:"typescript"},"TypeScript"),(0,o.kt)("p",null,"Only including important type changes."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Migrated ",(0,o.kt)("inlineCode",{parentName:"li"},"Arguments")," to ",(0,o.kt)("inlineCode",{parentName:"li"},"@boost/args")," structure."),(0,o.kt)("li",{parentName:"ul"},"Removed the generic from ",(0,o.kt)("inlineCode",{parentName:"li"},"Tool")," (formerly ",(0,o.kt)("inlineCode",{parentName:"li"},"Beemo"),")."),(0,o.kt)("li",{parentName:"ul"},"Removed:",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"BeemoPluginRegistry")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ExecuteType")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ExecuteQueue")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"StdioType"))))))}d.isMDXComponent=!0}}]);