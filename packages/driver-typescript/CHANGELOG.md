# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.0.0-alpha.1 - 2021-02-23

#### 💥 Breaking

- Drop TypeScript support below v4. ([d32e792](https://github.com/beemojs/beemo/commit/d32e792))
- Migrate to new `@boost/plugin` system. ([4e90dab](https://github.com/beemojs/beemo/commit/4e90dab))
- Update Node.js requirement to v10.17. ([6e688c8](https://github.com/beemojs/beemo/commit/6e688c8))

#### 🚀 Updates

- Support driver configs and scripts as TypeScript files. (#104) ([684a62c](https://github.com/beemojs/beemo/commit/684a62c)), closes [#104](https://github.com/beemojs/beemo/issues/104)

#### 🎨 Styles

- Run prettier. ([682e394](https://github.com/beemojs/beemo/commit/682e394))

#### ⚙️ Types

- Update config and args types. ([cd6e17f](https://github.com/beemojs/beemo/commit/cd6e17f))

#### 📦 Dependencies

- **[boost]** Update all to v2. ([83cf57b](https://github.com/beemojs/beemo/commit/83cf57b))
- Migrate packages to v2 alpha. ([598a1f1](https://github.com/beemojs/beemo/commit/598a1f1))

#### 📘 Docs

- Rework and expand examples. ([37ca795](https://github.com/beemojs/beemo/commit/37ca795))

#### 🛠 Internals

- Improve build output based on recent changes. ([850ce7e](https://github.com/beemojs/beemo/commit/850ce7e))
- Improve CLI performance and fix edge cases. ([c2afb9e](https://github.com/beemojs/beemo/commit/c2afb9e))
- Increase Boost code coverage. ([e30f13f](https://github.com/beemojs/beemo/commit/e30f13f))
- Migrate to Packemon for package building. (#102) ([e9d5f89](https://github.com/beemojs/beemo/commit/e9d5f89)), closes [#102](https://github.com/beemojs/beemo/issues/102)
- Rework how driver output is passed around. ([b3bd946](https://github.com/beemojs/beemo/commit/b3bd946))
- Rewrite built-in drivers and scripts. ([19a2cd5](https://github.com/beemojs/beemo/commit/19a2cd5))
- Rewrite run driver flow. ([82d4110](https://github.com/beemojs/beemo/commit/82d4110))
- Run linter and auto-fix. Sort imports/exports. ([b86f69e](https://github.com/beemojs/beemo/commit/b86f69e))
- Update developer tooling. ([32665ae](https://github.com/beemojs/beemo/commit/32665ae))
- Update tests to new APIs. ([f47067d](https://github.com/beemojs/beemo/commit/f47067d))
- Verify and improve driver piped output. (#111) ([518a9ae](https://github.com/beemojs/beemo/commit/518a9ae)), closes [#111](https://github.com/beemojs/beemo/issues/111)

**Note:** Version bump only for package @beemo/driver-typescript





### 1.4.1 - 2020-09-04

#### 📦 Dependencies

- Support TypeScript v4. ([67bb1bb](https://github.com/beemojs/beemo/commit/67bb1bb))

**Note:** Version bump only for package @beemo/driver-typescript





## 1.4.0 - 2020-06-22

#### 🚀 Updates

- Add `include` support for workspaces. ([feb91e0](https://github.com/beemojs/beemo/commit/feb91e0))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.3.4 - 2020-05-21

#### 📦 Dependencies

- Update minor and patch versions. ([87b8a14](https://github.com/beemojs/beemo/commit/87b8a14))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.3.3 - 2020-04-22

#### 🛠 Internals

- Run prettier. ([cbdef47](https://github.com/beemojs/beemo/commit/cbdef47))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.3.2 - 2020-02-10

#### 🐞 Fixes

- Remove composite from test config. (#76) ([26e408d](https://github.com/beemojs/beemo/commit/26e408d)), closes [#76](https://github.com/beemojs/beemo/issues/76)

#### 📦 Dependencies

- **[boost]** Update to latest. ([57693a9](https://github.com/beemojs/beemo/commit/57693a9))
- Update driver dependencies. ([1238627](https://github.com/beemojs/beemo/commit/1238627))

#### 🛠 Internals

- Fix syntax and composite issues. ([e2c67d2](https://github.com/beemojs/beemo/commit/e2c67d2))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.3.1 - 2020-01-25

#### 📦 Dependencies

- **[boost]** Update to latest. ([c2a5e94](https://github.com/beemojs/beemo/commit/c2a5e94))
- Update drivers to latest. ([0f03ef8](https://github.com/beemojs/beemo/commit/0f03ef8))

**Note:** Version bump only for package @beemo/driver-typescript





## 1.3.0 - 2019-12-10

#### 🚀 Updates

- Update config types. ([1110364](https://github.com/beemojs/beemo/commit/1110364))

#### ⚙️ Types

- Add driver specific args interface. ([068e0c6](https://github.com/beemojs/beemo/commit/068e0c6))

**Note:** Version bump only for package @beemo/driver-typescript





## 1.2.0 - 2019-12-08

#### 🚀 Updates

- Improve error output for failed drivers and scripts. (#73) ([d9324c9](https://github.com/beemojs/beemo/commit/d9324c9)), closes [#73](https://github.com/beemojs/beemo/issues/73)
- Support compiled lib paths for configs and scripts. (#70) ([5146d4c](https://github.com/beemojs/beemo/commit/5146d4c)), closes [#70](https://github.com/beemojs/beemo/issues/70)
- Support Windows OS and Node v13. (#68) ([94ebe84](https://github.com/beemojs/beemo/commit/94ebe84)), closes [#68](https://github.com/beemojs/beemo/issues/68)

#### 🐞 Fixes

- Set `filterOptions` to true by default. ([b7e695c](https://github.com/beemojs/beemo/commit/b7e695c))

#### 📦 Dependencies

- **[beemo]** Update to latest. ([db12a13](https://github.com/beemojs/beemo/commit/db12a13))
- Update drivers to latest. ([b45cc46](https://github.com/beemojs/beemo/commit/b45cc46))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.6 - 2019-11-25

#### 🐞 Fixes

- Normalize generated file paths to reduce churn. ([f3f23a0](https://github.com/beemojs/beemo/commit/f3f23a0))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.5 - 2019-11-13

#### ⚙️ Types

- Add new and missing compiler options. ([6a4a205](https://github.com/commit/6a4a205))

#### 📦 Dependencies

- **[boost]** Update to latest. Rework `@types` packages. ([9a945ba](https://github.com/commit/9a945ba))

#### 🛠 Internals

- Migrate to GitHub actions. (#65) ([d6d27af](https://github.com/commit/d6d27af)), closes [#65](https://github.com/issues/65)

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.4 - 2019-10-30

#### 📦 Dependencies

- **[boost,execa]** Update to latest. ([a66692b](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/a66692b))
- Update drivers to latest. ([8e74463](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/8e74463))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.3 - 2019-09-10

#### 📦 Dependencies

- **[TypeScript]** Update to v3.6. ([b5b8916](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/b5b8916))
- Update remaining dependencies. ([9b35265](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/9b35265))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.2 - 2019-08-09

#### 📦 Dependencies

- **[Boost]** Update to latest. ([15550ad](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/15550ad))

**Note:** Version bump only for package @beemo/driver-typescript





### 1.1.1 - 2019-07-28

#### 🐞 Fixes

- Refine and improve types. Replace some any usage with unknown. ([162219a](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/162219a))

#### 📦 Dependencies

- Update all minor and patch versions. ([15c3f20](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/15c3f20))

**Note:** Version bump only for package @beemo/driver-typescript





## 1.1.0 - 2019-07-06

#### 🚀 Updates

- Add declarationOnly option to only emit declaration files. ([3ccfd82](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/3ccfd82))

#### 🐞 Fixes

- Resolve devDependencies when generating TS project references. ([c325b18](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/c325b18))

#### 📦 Dependencies

- Updated boost to v1.2. Migrate APIs. ([0a01612](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/0a01612))
- Updated driver deps. ([5ed870d](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/5ed870d))

#### 🛠 Internals

- Utilize generated tsconfig.json files. (#56) ([788843e](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/788843e)), closes [#56](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/issues/56)

**Note:** Version bump only for package @beemo/driver-typescript





### 1.0.1 - 2019-06-13

#### 📦 Dependencies

- Bump to latest. Fix peers and vulnerabilities. (#53) ([f8ba055](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/f8ba055)), closes [#53](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/issues/53)

#### 🛠 Internals

- Setup DangerJS and conventional changelog (#52) ([c253bf6](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/commit/c253bf6)), closes [#52](https://github.com/beemojs/beemo/tree/master/packages/driver-typescript/issues/52)

**Note:** Version bump only for package @beemo/driver-typescript





# 1.0.0 - 2019-05-18

#### 🎉 Release

- Initial release!

#### 🚀 Updates

- Added automatic project references support via the `--reference-workspaces` option.
- Added a `TypeScriptDriver#onCreateProjectConfigFile` event.
