# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
