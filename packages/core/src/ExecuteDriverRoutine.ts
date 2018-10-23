/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import fs from 'fs-extra';
import path from 'path';
import glob from 'fast-glob';
import { Routine, PackageConfig } from '@boost/core';
import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './execute/RunCommandRoutine';
import isPatternMatch from './utils/isPatternMatch';
import { BeemoTool } from './types';

export default class ExecuteDriverRoutine extends Routine<DriverContext, BeemoTool> {
  workspacePackages: PackageConfig[] = [];

  bootstrap() {
    const { args, primaryDriver, workspaces } = this.context;

    if (args.workspaces) {
      if (!workspaces || workspaces.length === 0) {
        throw new Error(
          this.tool.msg('errors:driverWorkspacesNotEnabled', { arg: args.workspaces }),
        );
      }

      this.workspacePackages = this.loadWorkspacePackages();

      this.getFilteredWorkspaces().forEach(pkg => {
        this.pipeParallelBuilds(pkg.workspaceName, {
          forceConfigOption: true,
          workspaceRoot: pkg.workspacePath,
        });
      });
    } else {
      this.pipeParallelBuilds(primaryDriver.name);
    }
  }

  async execute(context: DriverContext): Promise<string[]> {
    const { other, priority } = this.orderByWorkspacePriorityGraph();
    const concurrency = context.args.concurrency || this.tool.config.execute.concurrency;

    await this.serializeRoutines(null, priority);

    const response = await this.poolRoutines(null, concurrency ? { concurrency } : {}, other);

    if (response.errors.length > 0) {
      let message = this.tool.msg('errors:driverExecuteFailed');

      response.errors.forEach(error => {
        message += '\n\n';
        message += error.message.split(/\s+at\s+/u)[0].trim();
      });

      throw new Error(message);
    }

    return response.results;
  }

  /**
   * Return a list of workspaces optionally filtered.
   */
  getFilteredWorkspaces(): PackageConfig[] {
    return this.workspacePackages.filter(pkg =>
      // @ts-ignore Contains not typed yet.
      isPatternMatch(pkg.name, this.context.args.workspaces, { contains: true }),
    );
  }

  /**
   * Load package.json from each workspace package.
   */
  loadWorkspacePackages(): PackageConfig[] {
    return glob
      .sync(this.context.workspaces.map(ws => `${ws}/package.json`), {
        absolute: true,
        cwd: this.context.root,
      })
      .map(filePath => {
        const pkg = JSON.parse(fs.readFileSync(String(filePath), 'utf8'));

        pkg.packagePath = filePath;
        pkg.workspacePath = path.dirname(String(filePath));
        pkg.workspaceName = path.basename(pkg.workspacePath);

        return pkg;
      });
  }

  /**
   * Group routines in order of which they are dependend on.
   */
  orderByWorkspacePriorityGraph(): {
    other: Routine<DriverContext, BeemoTool>[];
    priority: Routine<DriverContext, BeemoTool>[];
  } {
    const enabled = this.context.args.priority || this.tool.config.execute.priority;

    if (!enabled || !this.context.args.workspaces) {
      return {
        other: this.routines,
        priority: [],
      };
    }

    const packages: { [name: string]: PackageConfig } = {};
    const depCounts: { [name: string]: { count: number; package: PackageConfig } } = {};

    function countDep(name: string) {
      if (depCounts[name]) {
        depCounts[name].count += 1;
      } else {
        depCounts[name] = {
          count: packages[name].priority || 1,
          package: packages[name],
        };
      }
    }

    // Create a mapping of package names within all workspaces
    this.workspacePackages.forEach(pkg => {
      packages[pkg.name] = pkg;

      // Count it immediately, as it may not be dependend on
      if (pkg.priority) {
        countDep(pkg.name);
      }
    });

    // Determine dependend on packages by resolving the graph and incrementing counts
    this.workspacePackages.forEach(pkg => {
      const deps = {
        ...pkg.dependencies,
        ...pkg.peerDependencies,
      };

      Object.keys(deps).forEach(depName => {
        if (packages[depName]) {
          countDep(depName);
        }
      });
    });

    // Order by highest count
    const orderedDeps = Object.values(depCounts)
      .sort((a, b) => b.count - a.count)
      .map(dep => dep.package);

    // Extract dependents in order
    const priority: Routine<DriverContext, BeemoTool>[] = [];

    orderedDeps.forEach(pkg => {
      const routine = this.routines.find(route => route.key === pkg.workspaceName);

      if (routine) {
        priority.push(routine);
      }
    });

    // Extract dependers
    const other: Routine<DriverContext, BeemoTool>[] = [];

    this.routines.forEach(routine => {
      const dependency = orderedDeps.find(dep => dep.workspaceName === routine.key);

      if (!dependency) {
        other.push(routine);
      }
    });

    return {
      other,
      priority,
    };
  }

  /**
   * When a parallel pipe "//" is defined, we need to create an additional routine
   * for each instance.
   */
  pipeParallelBuilds(key: string, options: Partial<RunCommandOptions> = {}) {
    const { argv, parallelArgv, primaryDriver } = this.context;
    const command = `${primaryDriver.metadata.bin} ${argv.join(' ')}`;

    if (parallelArgv.length > 0) {
      parallelArgv.forEach(pargv => {
        this.pipe(
          new RunCommandRoutine(key, `${command} ${pargv.join(' ')}`, {
            ...options,
            additionalArgv: pargv,
          }),
        );
      });
    } else {
      this.pipe(new RunCommandRoutine(key, command, options));
    }
  }
}
