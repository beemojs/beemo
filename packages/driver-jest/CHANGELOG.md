# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 2.0.0 - 2021-07-18

#### ⚙️ Types

- Export driver type from index. ([e0ffd40](https://github.com/beemojs/beemo/commit/e0ffd40))

#### 🛠 Internals

- Drop prerelease suffix from peer deps. ([b2783a5](https://github.com/beemojs/beemo/commit/b2783a5))
- Increase code coverage. ([fe8251d](https://github.com/beemojs/beemo/commit/fe8251d))

**Note:** Version bump only for package @beemo/driver-jest





# 2.0.0-rc.3 - 2021-07-11

#### 💥 Breaking

- Rework output streams with new strategies. (#126) ([82f288b](https://github.com/beemojs/beemo/commit/82f288b)), closes [#126](https://github.com/beemojs/beemo/issues/126)

#### 🚀 Updates

- Update to TS v4.3. ([5c3cc38](https://github.com/beemojs/beemo/commit/5c3cc38))

#### 📦 Dependencies

- **[jest]** Update to v27 latest. ([5bd5d6a](https://github.com/beemojs/beemo/commit/5bd5d6a))
- **[jest]** Update to v27. (#137) ([f6d7f80](https://github.com/beemojs/beemo/commit/f6d7f80)), closes [#137](https://github.com/beemojs/beemo/issues/137)
- **[packemon]** Update to v1 alpha. (#138) ([5e0e31f](https://github.com/beemojs/beemo/commit/5e0e31f)), closes [#138](https://github.com/beemojs/beemo/issues/138)

**Note:** Version bump only for package @beemo/driver-jest





# 2.0.0-rc.2 - 2021-06-05

#### 💥 Breaking

- Update Node.js requirement to v12. (#134) ([f2423f8](https://github.com/beemojs/beemo/commit/f2423f8)), closes [#134](https://github.com/beemojs/beemo/issues/134)

#### 🚀 Updates

- Support Jest v27. ([1aac829](https://github.com/beemojs/beemo/commit/1aac829))

#### 🎨 Styles

- Switch to tabs from spaces. (#133) ([ab4d6c3](https://github.com/beemojs/beemo/commit/ab4d6c3)), closes [#133](https://github.com/beemojs/beemo/issues/133)

**Note:** Version bump only for package @beemo/driver-jest





### 2.0.0-rc.1 - 2021-05-07

#### 🛠 Internals

- Migrate to Yarn 2. (#130) ([d0d6332](https://github.com/beemojs/beemo/commit/d0d6332)), closes [#130](https://github.com/beemojs/beemo/issues/130)
- Switch to @beemo/dev for configs. (#131) ([8996d55](https://github.com/beemojs/beemo/commit/8996d55)), closes [#131](https://github.com/beemojs/beemo/issues/131)

**Note:** Version bump only for package @beemo/driver-jest





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

**Note:** Version bump only for package @beemo/driver-jest





### 2.0.0-alpha.2 - 2021-02-25

#### 🐞 Fixes

- Rebuild for prerelease. ([f73ee76](https://github.com/beemojs/beemo/commit/f73ee76))

**Note:** Version bump only for package @beemo/driver-jest





# 2.0.0-alpha.1 - 2021-02-23

#### 💥 Breaking

- Drop Jest support below v26. ([368fc11](https://github.com/beemojs/beemo/commit/368fc11))
- Migrate to new `@boost/plugin` system. ([4e90dab](https://github.com/beemojs/beemo/commit/4e90dab))
- Removed Babel driver requirement from Jest. ([baff9e6](https://github.com/beemojs/beemo/commit/baff9e6))
- Update Node.js requirement to v10.17. ([6e688c8](https://github.com/beemojs/beemo/commit/6e688c8))

#### ⚙️ Types

- Update config and args types. ([29890ea](https://github.com/beemojs/beemo/commit/29890ea))

#### 📦 Dependencies

- Migrate packages to v2 alpha. ([598a1f1](https://github.com/beemojs/beemo/commit/598a1f1))

#### 📘 Docs

- Rework and expand examples. ([37ca795](https://github.com/beemojs/beemo/commit/37ca795))

#### 🛠 Internals

- Improve build output based on recent changes. ([850ce7e](https://github.com/beemojs/beemo/commit/850ce7e))
- Migrate to Packemon for package building. (#102) ([e9d5f89](https://github.com/beemojs/beemo/commit/e9d5f89)), closes [#102](https://github.com/beemojs/beemo/issues/102)
- Rework how driver output is passed around. ([b3bd946](https://github.com/beemojs/beemo/commit/b3bd946))
- Rewrite built-in drivers and scripts. ([19a2cd5](https://github.com/beemojs/beemo/commit/19a2cd5))
- Run linter and auto-fix. Sort imports/exports. ([b86f69e](https://github.com/beemojs/beemo/commit/b86f69e))
- Update test and build system. ([3a362b6](https://github.com/beemojs/beemo/commit/3a362b6))
- Update tests to new APIs. ([f47067d](https://github.com/beemojs/beemo/commit/f47067d))
- Verify and improve driver piped output. (#111) ([518a9ae](https://github.com/beemojs/beemo/commit/518a9ae)), closes [#111](https://github.com/beemojs/beemo/issues/111)

**Note:** Version bump only for package @beemo/driver-jest





### 1.2.3 - 2020-05-21

#### 📦 Dependencies

- **[jest]** Add support for v26. ([0d309b3](https://github.com/beemojs/beemo/commit/0d309b3))

**Note:** Version bump only for package @beemo/driver-jest





### 1.2.2 - 2020-04-22

#### 📦 Dependencies

- **[jest]** Update driver. ([fd6cb79](https://github.com/beemojs/beemo/commit/fd6cb79))

**Note:** Version bump only for package @beemo/driver-jest





### 1.2.1 - 2020-02-10

#### 📦 Dependencies

- Update driver dependencies. ([1238627](https://github.com/beemojs/beemo/commit/1238627))

#### 🛠 Internals

- Fix syntax and composite issues. ([e2c67d2](https://github.com/beemojs/beemo/commit/e2c67d2))

**Note:** Version bump only for package @beemo/driver-jest





## 1.2.0 - 2020-01-25

#### 🚀 Updates

- Allow v25 dependency. ([8fd9b3a](https://github.com/beemojs/beemo/commit/8fd9b3a))

**Note:** Version bump only for package @beemo/driver-jest





### 1.1.1 - 2019-12-10

#### ⚙️ Types

- Add driver specific args interface. ([068e0c6](https://github.com/beemojs/beemo/commit/068e0c6))

**Note:** Version bump only for package @beemo/driver-jest





## 1.1.0 - 2019-12-08

#### 🚀 Updates

- Improve error output for failed drivers and scripts. (#73) ([d9324c9](https://github.com/beemojs/beemo/commit/d9324c9)), closes [#73](https://github.com/beemojs/beemo/issues/73)

#### 🐞 Fixes

- Set `filterOptions` to true by default. ([b7e695c](https://github.com/beemojs/beemo/commit/b7e695c))

#### 🛠 Internals

- Migrate to GitHub actions. (#65) ([d6d27af](https://github.com/beemojs/beemo/commit/d6d27af)), closes [#65](https://github.com/beemojs/beemo/issues/65)

**Note:** Version bump only for package @beemo/driver-jest





### 1.0.4 - 2019-10-30

#### 🐞 Fixes

- Remove `utility-types` in favor of native Omit. ([659faeb](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/659faeb))

**Note:** Version bump only for package @beemo/driver-jest





### 1.0.3 - 2019-09-10

#### 📦 Dependencies

- **[Jest]** Update to v24.9. ([014ba64](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/014ba64))

**Note:** Version bump only for package @beemo/driver-jest





### 1.0.2 - 2019-07-06

#### 📦 Dependencies

- Updated execa to v2. ([b5bec8c](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/b5bec8c))

#### 🛠 Internals

- Utilize generated tsconfig.json files. (#56) ([788843e](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/788843e)), closes [#56](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/issues/56)

**Note:** Version bump only for package @beemo/driver-jest





### 1.0.1 - 2019-06-13

#### 📦 Dependencies

- Bump to latest. Fix peers and vulnerabilities. (#53) ([f8ba055](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/f8ba055)), closes [#53](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/issues/53)

#### 🛠 Internals

- Setup DangerJS and conventional changelog (#52) ([c253bf6](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/commit/c253bf6)), closes [#52](https://github.com/beemojs/beemo/tree/master/packages/driver-jest/issues/52)

**Note:** Version bump only for package @beemo/driver-jest





# 1.0.0 - 2019-05-18

#### 🎉 Release

- Initial release!
