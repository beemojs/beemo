# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.0.0 - 2021-07-18

#### 🚀 Updates

- Initial support for PnP. (#140) ([7cc7271](https://github.com/beemojs/beemo/commit/7cc7271)), closes [#140](https://github.com/beemojs/beemo/issues/140)

#### ⚙️ Types

- Export driver type from index. ([e0ffd40](https://github.com/beemojs/beemo/commit/e0ffd40))

#### 🛠 Internals

- Drop prerelease suffix from peer deps. ([b2783a5](https://github.com/beemojs/beemo/commit/b2783a5))
- Increase code coverage. ([fe8251d](https://github.com/beemojs/beemo/commit/fe8251d))

**Note:** Version bump only for package @beemo/driver-prettier





# 2.0.0-rc.4 - 2021-07-11

#### 💥 Breaking

- Rework output streams with new strategies. (#126) ([82f288b](https://github.com/beemojs/beemo/commit/82f288b)), closes [#126](https://github.com/beemojs/beemo/issues/126)

#### 🚀 Updates

- Update to TS v4.3. ([5c3cc38](https://github.com/beemojs/beemo/commit/5c3cc38))

#### 📦 Dependencies

- **[packemon]** Update to v1 alpha. (#138) ([5e0e31f](https://github.com/beemojs/beemo/commit/5e0e31f)), closes [#138](https://github.com/beemojs/beemo/issues/138)
- **[prettier]** Update to v2.3 latest. ([44a2bc7](https://github.com/beemojs/beemo/commit/44a2bc7))

**Note:** Version bump only for package @beemo/driver-prettier





# 2.0.0-rc.3 - 2021-06-05

#### 💥 Breaking

- Update Node.js requirement to v12. (#134) ([f2423f8](https://github.com/beemojs/beemo/commit/f2423f8)), closes [#134](https://github.com/beemojs/beemo/issues/134)

#### 🎨 Styles

- Switch to tabs from spaces. (#133) ([ab4d6c3](https://github.com/beemojs/beemo/commit/ab4d6c3)), closes [#133](https://github.com/beemojs/beemo/issues/133)

#### 📦 Dependencies

- **[prettier]** Update to v2.3. ([76aa3d6](https://github.com/beemojs/beemo/commit/76aa3d6))

**Note:** Version bump only for package @beemo/driver-prettier





### 2.0.0-rc.2 - 2021-05-07

#### 🛠 Internals

- Switch to @beemo/dev for configs. (#131) ([8996d55](https://github.com/beemojs/beemo/commit/8996d55)), closes [#131](https://github.com/beemojs/beemo/issues/131)

**Note:** Version bump only for package @beemo/driver-prettier





### 2.0.0-rc.1 - 2021-04-13

#### 📦 Dependencies

- **[boost]** Update to latest. ([f7831d2](https://github.com/beemojs/beemo/commit/f7831d2))

**Note:** Version bump only for package @beemo/driver-prettier





# 2.0.0-rc.0 - 2021-03-20

#### 💥 Breaking

- Support driver CLI commands. Move TS project reference syncing. (#123) ([ab78a75](https://github.com/beemojs/beemo/commit/ab78a75)), closes [#123](https://github.com/beemojs/beemo/issues/123)

#### 🚀 Updates

- Add "template" strategy for full driver config control. (#114) ([10ebc4b](https://github.com/beemojs/beemo/commit/10ebc4b)), closes [#114](https://github.com/beemojs/beemo/issues/114)
- Add `expandGlobs` option to `DriverOptions`. (#121) ([b04da5d](https://github.com/beemojs/beemo/commit/b04da5d)), closes [#121](https://github.com/beemojs/beemo/issues/121)

#### 📦 Dependencies

- **[packemon]** Update to v0.13. ([1488e86](https://github.com/beemojs/beemo/commit/1488e86))
- **[packemon]** Update to v0.14. (#124) ([4cce9df](https://github.com/beemojs/beemo/commit/4cce9df)), closes [#124](https://github.com/beemojs/beemo/issues/124)

#### 📘 Docs

- Migrate to Docusaurus. (#125) ([39ba2b4](https://github.com/beemojs/beemo/commit/39ba2b4)), closes [#125](https://github.com/beemojs/beemo/issues/125)

#### 🛠 Internals

- Add funding links. ([c176d75](https://github.com/beemojs/beemo/commit/c176d75))

**Note:** Version bump only for package @beemo/driver-prettier





### 2.0.0-alpha.2 - 2021-02-25

#### 🐞 Fixes

- Rebuild for prerelease. ([f73ee76](https://github.com/beemojs/beemo/commit/f73ee76))

**Note:** Version bump only for package @beemo/driver-prettier





# 2.0.0-alpha.1 - 2021-02-23

#### 💥 Breaking

- Drop Prettier support below v2. ([58c29c2](https://github.com/beemojs/beemo/commit/58c29c2))
- Migrate to new `@boost/plugin` system. ([4e90dab](https://github.com/beemojs/beemo/commit/4e90dab))
- Update Node.js requirement to v10.17. ([6e688c8](https://github.com/beemojs/beemo/commit/6e688c8))

#### 🎨 Styles

- Run prettier. ([682e394](https://github.com/beemojs/beemo/commit/682e394))

#### ⚙️ Types

- Update config and args types. ([7800c6d](https://github.com/beemojs/beemo/commit/7800c6d))

#### 📦 Dependencies

- **[boost]** Update all to v2. ([83cf57b](https://github.com/beemojs/beemo/commit/83cf57b))
- Migrate packages to v2 alpha. ([598a1f1](https://github.com/beemojs/beemo/commit/598a1f1))

#### 📘 Docs

- Rework and expand examples. ([37ca795](https://github.com/beemojs/beemo/commit/37ca795))

#### 🛠 Internals

- Improve build output based on recent changes. ([850ce7e](https://github.com/beemojs/beemo/commit/850ce7e))
- Increase Boost code coverage. ([e30f13f](https://github.com/beemojs/beemo/commit/e30f13f))
- Migrate to Packemon for package building. (#102) ([e9d5f89](https://github.com/beemojs/beemo/commit/e9d5f89)), closes [#102](https://github.com/beemojs/beemo/issues/102)
- Rewrite built-in drivers and scripts. ([19a2cd5](https://github.com/beemojs/beemo/commit/19a2cd5))
- Rewrite run driver flow. ([82d4110](https://github.com/beemojs/beemo/commit/82d4110))
- Run linter and auto-fix. Sort imports/exports. ([b86f69e](https://github.com/beemojs/beemo/commit/b86f69e))
- Update tests to new APIs. ([f47067d](https://github.com/beemojs/beemo/commit/f47067d))
- Verify and improve driver piped output. (#111) ([518a9ae](https://github.com/beemojs/beemo/commit/518a9ae)), closes [#111](https://github.com/beemojs/beemo/issues/111)

**Note:** Version bump only for package @beemo/driver-prettier





### 1.3.2 - 2020-05-21

#### 📦 Dependencies

- Update minor and patch versions. ([87b8a14](https://github.com/beemojs/beemo/commit/87b8a14))

**Note:** Version bump only for package @beemo/driver-prettier





### 1.3.1 - 2020-04-22

#### ⚙️ Types

- Support config overrides. [#80] ([721c1a2](https://github.com/beemojs/beemo/commit/721c1a2)), closes [#80](https://github.com/beemojs/beemo/issues/80)

#### 🛠 Internals

- Run prettier. ([cbdef47](https://github.com/beemojs/beemo/commit/cbdef47))

**Note:** Version bump only for package @beemo/driver-prettier





## 1.3.0 - 2020-03-21

#### 🚀 Updates

- Add support for v2. ([c10afc8](https://github.com/beemojs/beemo/commit/c10afc8))

#### 📦 Dependencies

- Update drivers to latest. ([4c39c71](https://github.com/beemojs/beemo/commit/4c39c71))

**Note:** Version bump only for package @beemo/driver-prettier





### 1.2.2 - 2020-02-10

#### 📦 Dependencies

- **[boost]** Update to latest. ([57693a9](https://github.com/beemojs/beemo/commit/57693a9))

#### 🛠 Internals

- Fix syntax and composite issues. ([e2c67d2](https://github.com/beemojs/beemo/commit/e2c67d2))

**Note:** Version bump only for package @beemo/driver-prettier





### 1.2.1 - 2020-01-25

#### 📦 Dependencies

- **[boost]** Update to latest. ([c2a5e94](https://github.com/beemojs/beemo/commit/c2a5e94))

**Note:** Version bump only for package @beemo/driver-prettier





## 1.2.0 - 2019-12-10

#### 🚀 Updates

- Update config types. ([5d079ee](https://github.com/beemojs/beemo/commit/5d079ee))

#### ⚙️ Types

- Add driver specific args interface. ([068e0c6](https://github.com/beemojs/beemo/commit/068e0c6))

**Note:** Version bump only for package @beemo/driver-prettier





## 1.1.0 - 2019-12-08

#### 🚀 Updates

- Improve error output for failed drivers and scripts. (#73) ([d9324c9](https://github.com/beemojs/beemo/commit/d9324c9)), closes [#73](https://github.com/beemojs/beemo/issues/73)
- Support Windows OS and Node v13. (#68) ([94ebe84](https://github.com/beemojs/beemo/commit/94ebe84)), closes [#68](https://github.com/beemojs/beemo/issues/68)

#### 🐞 Fixes

- Set `filterOptions` to true by default. ([b7e695c](https://github.com/beemojs/beemo/commit/b7e695c))

**Note:** Version bump only for package @beemo/driver-prettier





### 1.0.4 - 2019-11-13

#### 📦 Dependencies

- **[boost]** Update to latest. Rework `@types` packages. ([9a945ba](https://github.com/commit/9a945ba))
- Update drivers to latest. ([7f67ea3](https://github.com/commit/7f67ea3))

#### 🛠 Internals

- Migrate to GitHub actions. (#65) ([d6d27af](https://github.com/commit/d6d27af)), closes [#65](https://github.com/issues/65)

**Note:** Version bump only for package @beemo/driver-prettier





### 1.0.3 - 2019-08-09

#### 📦 Dependencies

- **[Boost]** Update to latest. ([15550ad](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/commit/15550ad))

**Note:** Version bump only for package @beemo/driver-prettier





### 1.0.2 - 2019-07-06

#### 📦 Dependencies

- Updated boost to v1.2. Migrate APIs. ([0a01612](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/commit/0a01612))

#### 🛠 Internals

- Utilize generated tsconfig.json files. (#56) ([788843e](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/commit/788843e)), closes [#56](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/issues/56)

**Note:** Version bump only for package @beemo/driver-prettier





### 1.0.1 - 2019-06-13

#### 📦 Dependencies

- Bump to latest. Fix peers and vulnerabilities. (#53) ([f8ba055](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/commit/f8ba055)), closes [#53](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/issues/53)

#### 🛠 Internals

- Setup DangerJS and conventional changelog (#52) ([c253bf6](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/commit/c253bf6)), closes [#52](https://github.com/beemojs/beemo/tree/master/packages/driver-prettier/issues/52)

**Note:** Version bump only for package @beemo/driver-prettier





# 1.0.0 - 2019-05-18

#### 🎉 Release

- Initial release!

#### 🚀 Updates

- Added a `PrettierDriver.onCreateIgnoreFile` event.
