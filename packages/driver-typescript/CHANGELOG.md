# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
