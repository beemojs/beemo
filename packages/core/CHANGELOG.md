# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.0.0-alpha.1 - 2021-02-23

#### 💥 Breaking

- Deprecate @beemo/dependency-graph package. ([c2d7c37](https://github.com/beemojs/beemo/commit/c2d7c37))
- Integrate new `@boost/config` system. Move config file and change plugin settings. ([0ace673](https://github.com/beemojs/beemo/commit/0ace673))
- Migrate to new `@boost/cli` system. ([9dad217](https://github.com/beemojs/beemo/commit/9dad217))
- Migrate to new `@boost/debug` system. ([42a3fa4](https://github.com/beemojs/beemo/commit/42a3fa4))
- Migrate to new `@boost/plugin` system. ([4e90dab](https://github.com/beemojs/beemo/commit/4e90dab))
- Migrate to new `@boost/translate` system. ([fb9fb59](https://github.com/beemojs/beemo/commit/fb9fb59))
- Update Node.js requirement to v10.17. ([6e688c8](https://github.com/beemojs/beemo/commit/6e688c8))

#### 🚀 Updates

- Add `@beemo/driver-lerna` package. (#109) ([162bedc](https://github.com/beemojs/beemo/commit/162bedc)), closes [#109](https://github.com/beemojs/beemo/issues/109)
- Add `@beemo/driver-rollup` package. (#108) ([7601559](https://github.com/beemojs/beemo/commit/7601559)), closes [#108](https://github.com/beemojs/beemo/issues/108)
- Add `@beemo/driver-stylelint` package. (#103) ([be62dbc](https://github.com/beemojs/beemo/commit/be62dbc)), closes [#103](https://github.com/beemojs/beemo/issues/103)
- Add support for local driver config overrides. (#105) ([e4bf0e9](https://github.com/beemojs/beemo/commit/e4bf0e9)), closes [#105](https://github.com/beemojs/beemo/issues/105)
- Improve branding experience. (#110) ([2a1ac12](https://github.com/beemojs/beemo/commit/2a1ac12)), closes [#110](https://github.com/beemojs/beemo/issues/110)
- Improve Hygen integration. (#107) ([89b2655](https://github.com/beemojs/beemo/commit/89b2655)), closes [#107](https://github.com/beemojs/beemo/issues/107)
- Support driver configs and scripts as TypeScript files. (#104) ([684a62c](https://github.com/beemojs/beemo/commit/684a62c)), closes [#104](https://github.com/beemojs/beemo/issues/104)
- Support tuples for plugin configurations. ([79d1c04](https://github.com/beemojs/beemo/commit/79d1c04))

#### 🎨 Styles

- Run prettier. ([682e394](https://github.com/beemojs/beemo/commit/682e394))

#### 📦 Dependencies

- **[boost]** Update all to v2. ([83cf57b](https://github.com/beemojs/beemo/commit/83cf57b))
- **[chalk]** Update to v4. ([a69686f](https://github.com/beemojs/beemo/commit/a69686f))
- **[execa]** Update to v4. ([77baaae](https://github.com/beemojs/beemo/commit/77baaae))
- **[fs-extra]** Update to v9. ([829a5fa](https://github.com/beemojs/beemo/commit/829a5fa))
- **[hygen]** Update to v6. ([1a31d39](https://github.com/beemojs/beemo/commit/1a31d39))
- Migrate packages to v2 alpha. ([598a1f1](https://github.com/beemojs/beemo/commit/598a1f1))

#### 📘 Docs

- Rework and expand examples. ([37ca795](https://github.com/beemojs/beemo/commit/37ca795))
- Update NodeJS version in readmes. ([edd09d9](https://github.com/beemojs/beemo/commit/edd09d9))

#### 🛠 Internals

- Cleanup on CLI failure. ([7a3073b](https://github.com/beemojs/beemo/commit/7a3073b))
- Improve build output based on recent changes. ([850ce7e](https://github.com/beemojs/beemo/commit/850ce7e))
- Improve CLI performance and fix edge cases. ([c2afb9e](https://github.com/beemojs/beemo/commit/c2afb9e))
- Increase Boost code coverage. ([e30f13f](https://github.com/beemojs/beemo/commit/e30f13f))
- Migrate to Packemon for package building. (#102) ([e9d5f89](https://github.com/beemojs/beemo/commit/e9d5f89)), closes [#102](https://github.com/beemojs/beemo/issues/102)
- Rework how driver output is passed around. ([b3bd946](https://github.com/beemojs/beemo/commit/b3bd946))
- Rewrite built-in drivers and scripts. ([19a2cd5](https://github.com/beemojs/beemo/commit/19a2cd5))
- Rewrite create config flow. ([a002a1a](https://github.com/beemojs/beemo/commit/a002a1a))
- Rewrite run driver flow. ([82d4110](https://github.com/beemojs/beemo/commit/82d4110))
- Rewrite run script flow. ([05a1fa2](https://github.com/beemojs/beemo/commit/05a1fa2))
- Rewrite scaffolding flow. ([2522766](https://github.com/beemojs/beemo/commit/2522766))
- Run linter and auto-fix. Sort imports/exports. ([b86f69e](https://github.com/beemojs/beemo/commit/b86f69e))
- Update developer tooling. ([32665ae](https://github.com/beemojs/beemo/commit/32665ae))
- Update integration tests. ([115a09e](https://github.com/beemojs/beemo/commit/115a09e))
- Update tests to new APIs. ([f47067d](https://github.com/beemojs/beemo/commit/f47067d))
- Update workflows. Test against Node 14. ([3c2839c](https://github.com/beemojs/beemo/commit/3c2839c))
- Use Boost utilities for debug message styling. ([33067d6](https://github.com/beemojs/beemo/commit/33067d6))
- Verify and improve driver piped output. (#111) ([518a9ae](https://github.com/beemojs/beemo/commit/518a9ae)), closes [#111](https://github.com/beemojs/beemo/issues/111)

**Note:** Version bump only for package @beemo/core





### 1.1.8 - 2020-05-21

#### 📦 Dependencies

- Update minor and patch versions. ([87b8a14](https://github.com/beemojs/beemo/commit/87b8a14))

**Note:** Version bump only for package @beemo/core





### 1.1.7 - 2020-04-22

#### 📦 Dependencies

- **[boost]** Update to latest. ([37e8b15](https://github.com/beemojs/beemo/commit/37e8b15))

#### 🛠 Internals

- Run prettier. ([cbdef47](https://github.com/beemojs/beemo/commit/cbdef47))

**Note:** Version bump only for package @beemo/core





### 1.1.6 - 2020-03-21

#### 📦 Dependencies

- **[yargs]** Update to v15.3. ([7649890](https://github.com/beemojs/beemo/commit/7649890))

**Note:** Version bump only for package @beemo/core





### 1.1.5 - 2020-03-02

#### 🐞 Fixes

- Another attempt at fixing scaffold template paths. (#78) ([d025bb9](https://github.com/beemojs/beemo/commit/d025bb9)), closes [#78](https://github.com/beemojs/beemo/issues/78)

#### 📦 Dependencies

- Update driver dependencies. ([8de8be3](https://github.com/beemojs/beemo/commit/8de8be3))
- Update root and dev dependencies. ([7387d1d](https://github.com/beemojs/beemo/commit/7387d1d))

**Note:** Version bump only for package @beemo/core





### 1.1.4 - 2020-02-10

#### 🐞 Fixes

- Fix invalid scaffolding path. ([f9d0229](https://github.com/beemojs/beemo/commit/f9d0229))

**Note:** Version bump only for package @beemo/core





### 1.1.3 - 2020-02-10

#### 📦 Dependencies

- **[boost]** Update to latest. ([57693a9](https://github.com/beemojs/beemo/commit/57693a9))
- Update driver dependencies. ([1238627](https://github.com/beemojs/beemo/commit/1238627))
- Update root and dev dependencies. ([1efcf4d](https://github.com/beemojs/beemo/commit/1efcf4d))

#### 🛠 Internals

- Fix syntax and composite issues. ([e2c67d2](https://github.com/beemojs/beemo/commit/e2c67d2))

**Note:** Version bump only for package @beemo/core





### 1.1.2 - 2020-01-25

#### 🐞 Fixes

- Minor changes to support PnP. ([195fbdc](https://github.com/beemojs/beemo/commit/195fbdc))

#### 📦 Dependencies

- **[boost]** Update to latest. ([c2a5e94](https://github.com/beemojs/beemo/commit/c2a5e94))
- Update `@types` packages. ([1064a44](https://github.com/beemojs/beemo/commit/1064a44))
- **[yargs]** Update to v15.1. ([fa36035](https://github.com/beemojs/beemo/commit/fa36035))

**Note:** Version bump only for package @beemo/core





### 1.1.1 - 2019-12-10

#### ⚙️ Types

- Allow Beemo tool settings to be typed via generics. ([c3ad72a](https://github.com/beemojs/beemo/commit/c3ad72a))

**Note:** Version bump only for package @beemo/core





## 1.1.0 - 2019-12-08

#### 🚀 Updates

- Improve error output for failed drivers and scripts. (#73) ([d9324c9](https://github.com/beemojs/beemo/commit/d9324c9)), closes [#73](https://github.com/beemojs/beemo/issues/73)
- Support compiled lib paths for configs and scripts. (#70) ([5146d4c](https://github.com/beemojs/beemo/commit/5146d4c)), closes [#70](https://github.com/beemojs/beemo/issues/70)
- Support Windows OS and Node v13. (#68) ([94ebe84](https://github.com/beemojs/beemo/commit/94ebe84)), closes [#68](https://github.com/beemojs/beemo/issues/68)
- Use module resolution for config module bootstrapping. (#69) ([86c3403](https://github.com/beemojs/beemo/commit/86c3403)), closes [#69](https://github.com/beemojs/beemo/issues/69)

#### 🐞 Fixes

- Set `filterOptions` to true by default. ([b7e695c](https://github.com/beemojs/beemo/commit/b7e695c))

#### 📦 Dependencies

- **[beemo]** Update to latest. ([db12a13](https://github.com/beemojs/beemo/commit/db12a13))

#### 🛠 Internals

- Add new local package to house configs and scripts. (#72) ([5d8695d](https://github.com/beemojs/beemo/commit/5d8695d)), closes [#72](https://github.com/beemojs/beemo/issues/72)

**Note:** Version bump only for package @beemo/core





### 1.0.9 - 2019-11-25

#### 🐞 Fixes

- Normalize reference strategy path. [#66] ([b8efe41](https://github.com/beemojs/beemo/commit/b8efe41)), closes [#66](https://github.com/beemojs/beemo/issues/66)

#### 📦 Dependencies

- **[yargs]** Update to v15. ([460152c](https://github.com/beemojs/beemo/commit/460152c))

**Note:** Version bump only for package @beemo/core





### 1.0.8 - 2019-11-13

#### 📦 Dependencies

- **[boost]** Update to latest. Rework `@types` packages. ([9a945ba](https://github.com/commit/9a945ba))
- **[chalk]** Update to v3. ([b22fc59](https://github.com/commit/b22fc59))
- **[execa]** Update to v3.3. ([e9f8306](https://github.com/commit/e9f8306))
- **[yargs-parser]** Update to v16.1. ([ba83d17](https://github.com/commit/ba83d17))

#### 🛠 Internals

- Migrate to GitHub actions. (#65) ([d6d27af](https://github.com/commit/d6d27af)), closes [#65](https://github.com/issues/65)

**Note:** Version bump only for package @beemo/core





### 1.0.7 - 2019-10-30

#### 📦 Dependencies

- **[boost,execa]** Update to latest. ([a66692b](https://github.com/beemojs/beemo/tree/master/packages/core/commit/a66692b))
- **[hygen]** Update to v5. ([cff08a0](https://github.com/beemojs/beemo/tree/master/packages/core/commit/cff08a0))
- **[yargs,yargs-parser]** Update to latest. ([48bac7f](https://github.com/beemojs/beemo/tree/master/packages/core/commit/48bac7f))
- Rebuild lock file. ([34f3198](https://github.com/beemojs/beemo/tree/master/packages/core/commit/34f3198))
- Update [@types](https://github.com/types) packages. ([aba4190](https://github.com/beemojs/beemo/tree/master/packages/core/commit/aba4190))
- Update root dependencies. ([6fd1aea](https://github.com/beemojs/beemo/tree/master/packages/core/commit/6fd1aea))

**Note:** Version bump only for package @beemo/core





### 1.0.6 - 2019-09-10

#### 📦 Dependencies

- **[Babel]** Update to v7.6. ([51d37fd](https://github.com/beemojs/beemo/tree/master/packages/core/commit/51d37fd))
- **[ESLint]** Update to v6.3. ([3f9b6eb](https://github.com/beemojs/beemo/tree/master/packages/core/commit/3f9b6eb))
- **[Yargs]** Update to v14. ([e4fba8c](https://github.com/beemojs/beemo/tree/master/packages/core/commit/e4fba8c))
- Update remaining dependencies. ([9b35265](https://github.com/beemojs/beemo/tree/master/packages/core/commit/9b35265))

**Note:** Version bump only for package @beemo/core





### 1.0.5 - 2019-08-09

#### 📦 Dependencies

- Update dev versions. ([df01e03](https://github.com/beemojs/beemo/tree/master/packages/core/commit/df01e03))
- **[Boost]** Update to latest. ([15550ad](https://github.com/beemojs/beemo/tree/master/packages/core/commit/15550ad))
- Update minor and patch versions. ([4b5f532](https://github.com/beemojs/beemo/tree/master/packages/core/commit/4b5f532))

**Note:** Version bump only for package @beemo/core





### 1.0.4 - 2019-07-28

#### 🐞 Fixes

- Only merge arrays if both values are an array. ([2e6c6f5](https://github.com/beemojs/beemo/tree/master/packages/core/commit/2e6c6f5))
- Refine and improve types. Replace some any usage with unknown. ([162219a](https://github.com/beemojs/beemo/tree/master/packages/core/commit/162219a))

#### 📦 Dependencies

- Update all minor and patch versions. ([15c3f20](https://github.com/beemojs/beemo/tree/master/packages/core/commit/15c3f20))

**Note:** Version bump only for package @beemo/core





### 1.0.3 - 2019-07-06

#### 🐞 Fixes

- Persist exit code when driver executions fail. [#54] ([fdf0b10](https://github.com/beemojs/beemo/tree/master/packages/core/commit/fdf0b10)), closes [#54](https://github.com/beemojs/beemo/tree/master/packages/core/issues/54)

#### 📦 Dependencies

- Updated boost to v1.2. Migrate APIs. ([0a01612](https://github.com/beemojs/beemo/tree/master/packages/core/commit/0a01612))
- Updated build deps. ([bfa490c](https://github.com/beemojs/beemo/tree/master/packages/core/commit/bfa490c))
- Updated driver deps. ([5ed870d](https://github.com/beemojs/beemo/tree/master/packages/core/commit/5ed870d))
- Updated execa to v2. ([b5bec8c](https://github.com/beemojs/beemo/tree/master/packages/core/commit/b5bec8c))
- Updated fast-glob to v3. ([84b6497](https://github.com/beemojs/beemo/tree/master/packages/core/commit/84b6497))
- Updated fs-extra to v8.1. ([3faf131](https://github.com/beemojs/beemo/tree/master/packages/core/commit/3faf131))

#### 🛠 Internals

- Utilize generated tsconfig.json files. (#56) ([788843e](https://github.com/beemojs/beemo/tree/master/packages/core/commit/788843e)), closes [#56](https://github.com/beemojs/beemo/tree/master/packages/core/issues/56)

**Note:** Version bump only for package @beemo/core





### 1.0.2 - 2019-06-15

#### 🐞 Fixes

- Add debugging around child processes. Handle OOM errors. ([fbf9e19](https://github.com/beemojs/beemo/tree/master/packages/core/commit/fbf9e19))

**Note:** Version bump only for package @beemo/core





### 1.0.1 - 2019-06-13

#### 📦 Dependencies

- Bump to latest. Fix peers and vulnerabilities. (#53) ([f8ba055](https://github.com/beemojs/beemo/tree/master/packages/core/commit/f8ba055)), closes [#53](https://github.com/beemojs/beemo/tree/master/packages/core/issues/53)

#### 🛠 Internals

- Setup DangerJS and conventional changelog (#52) ([c253bf6](https://github.com/beemojs/beemo/tree/master/packages/core/commit/c253bf6)), closes [#52](https://github.com/beemojs/beemo/tree/master/packages/core/issues/52)

**Note:** Version bump only for package @beemo/core





# 1.0.0 - 2019-05-18

#### 💥 Breaking

- Migrated to the new [@boost/event](https://milesj.gitbook.io/boost/event) system.
- Script names (on the command line) will now error if not in kebab case.
- Scripts and Drivers now require an explicit `blueprint` method.
- Renamed `--live` option to `--stdio`.
- Renamed `--priority` option to `--graph`.
- Renamed `execute.priority` setting to `execute.graph`.
- Renamed `Context#root` to `cwd`.
- Renamed `Driver#handleFailure` to `processFailure`.
- Renamed `Driver#handleSuccess` to `processSuccess`.
- Removed `DriverContext#eventName` and `ScriptContext#eventName`.
- Removed `ScriptContext#binName`. Use `scriptName` instead.

#### 🚀 Updates

- Added a new package,
  [@beemo/dependency-graph](https://www.npmjs.com/package/@beemo/dependency-graph), to handle the
  dependency resolution.
- Added a `none` strategy to `Driver`s. With this strategy, the consumer will need to manually
  create a config file.
- Added a `versionOption` metadata setting to `Driver`s.
- Added `Script#executeCommand`, so that local binaries can easily be executed.
- Added optional `name` support to scaffolding.
- Updated the driver/script execution pipeline to process in parallel batches.

#### 🐞 Fixes

- Fixed script `this` scope being lost within script tasks.
- Fixed the Beemo emoji not appearing in the console.

#### 🛠 Internals

- `Beemo` now extends from `Tool` instead of managing an instance.
- Updated `hygen` to v4.
- Updated dependencies.
