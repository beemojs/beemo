# Scaffolding

Beemo can scaffold projects through the amazing [hygen](https://github.com/jondot/hygen) library.
Hygen separates templates into groupings of "generators" and "actions", coupling a front matter
concept with [ejs](http://ejs.co/), to deliver a powerful and convenient experience.

## Creating Templates

To make use of scaffolds, create `.ejs` files within your configuration module, located at
`./templates/<generator>/<action>`. For example, if I wanted to scaffold dotfiles, I may create the
following template for a `.gitignore`.

```
// templates/project/dotfiles/gitignore.ejs
---
to: .gitignore
---

node_modules/
logs/
*.log
```

> Hygen uses front matter to define target destination, overwrite rules, and more.
> [View the official documentation for more information](http://www.hygen.io/templates).

## Generating Files

Once our templates exist, we can generate files within our consumer using the
`yarn beem scaffold <generator> <action>` (or `npx beemo scaffold`) command. This command will copy
all files from the template folder to the `to` target defined in the `.ejs` front matter.

You can also define template variables through command line options like `--name`!

> Note: Beemo doesn't support Hygen prompts at the moment, so any existing files will be
> overwritten.
