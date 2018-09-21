# Scaffolding

Beemo can scaffold projects through the amazing [hygen](https://github.com/jondot/hygen) library.
Hygen separates templates into groupings of "generators" and "actions", coupling a front matter
concept with [ejs](http://ejs.co/), to deliver a powerful and convenient experience.

To make use of scaffolds, create ejs files within your configuration module, located at
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

Once our templates exist, we can generate files within our consumer using the
`yarn beem scaffold <generator> <action>` (or `npx beemo scaffold`) command. You can pass also pass
options like `--name`, which become variables in ejs!
