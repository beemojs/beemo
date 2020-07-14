/* eslint-disable jest/expect-expect */

import { Path, Project } from '@boost/common';
import { getFixturePath } from '@boost/test-utils';
import RunDriverRoutine from '../../src/routines/RunDriverRoutine';
import { ExecuteCommandOptions } from '../../src/routines/driver/ExecuteCommandRoutine';
import DriverContext from '../../src/contexts/DriverContext';
import { AnyRoutine } from '../../src/routines/RunInWorkspacesRoutine';
import Driver from '../../src/Driver';
import { mockDebugger, mockTool, mockDriver, stubDriverContext } from '../../src/testing';

jest.mock('execa');

describe('RunDriverRoutine', () => {
  let routine: RunDriverRoutine;
  let context: DriverContext;
  let driver: Driver;

  function expectPipedRoutines(
    routines: AnyRoutine[],
    tests: ({ key?: string; title: string } & Partial<ExecuteCommandOptions>)[],
  ) {
    expect(routines).toHaveLength(tests.length);

    tests.forEach((test, i) => {
      const { key, title, ...options } = test;

      if (key) {
        expect(routines[i]).toEqual(
          expect.objectContaining({
            key,
            title,
            options: expect.objectContaining(options),
          }),
        );
      } else {
        expect(routines[i]).toEqual(
          expect.objectContaining({
            title,
            options: expect.objectContaining(options),
          }),
        );
      }
    });
  }

  beforeEach(() => {
    const tool = mockTool();

    driver = mockDriver('primary', tool);
    context = stubDriverContext(driver);

    routine = new RunDriverRoutine('driver', 'Executing driver', { tool });
    // @ts-ignore
    routine.debug = mockDebugger();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the primary driver', async () => {
      await routine.execute(context);

      expectPipedRoutines(routine.routines, [{ title: 'primary -a --foo bar baz' }]);
    });

    it('adds multiple routines when parallel is used', async () => {
      context.parallelArgv = [
        ['--one', '--two=2'],
        ['--three', '-f'],
      ];

      await routine.execute(context);

      expectPipedRoutines(routine.routines, [
        { title: 'primary -a --foo bar baz' },
        { title: 'primary -a --foo bar baz --one --two=2', additionalArgv: ['--one', '--two=2'] },
        { title: 'primary -a --foo bar baz --three -f', additionalArgv: ['--three', '-f'] },
      ]);
    });

    it('adds a routine if parallel is empty', async () => {
      context.parallelArgv = [];

      await routine.execute(context);

      expectPipedRoutines(routine.routines, [{ title: 'primary -a --foo bar baz' }]);
    });

    describe('workspaces', () => {
      const fixturePath = new Path(getFixturePath('workspaces-driver'));

      beforeEach(() => {
        context.args.options.workspaces = '*';
        context.workspaces = ['packages/*'];
        context.workspaceRoot = fixturePath;
        context.cwd = fixturePath;

        // @ts-ignore
        routine.options.tool.project = new Project(fixturePath);
      });

      it('adds a routine for each', async () => {
        await routine.execute(context);

        expectPipedRoutines(routine.routines, [
          {
            key: 'bar',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/bar').path(),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/baz').path(),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/foo').path(),
          },
        ]);
      });

      it('adds a routine for each when parallel is used', async () => {
        context.parallelArgv = [
          ['--one', '--two=2'],
          ['--three', '-f'],
        ];

        await routine.execute(context);

        expectPipedRoutines(routine.routines, [
          {
            key: 'bar',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/bar').path(),
          },
          {
            key: 'bar',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/bar').path(),
          },
          {
            key: 'bar',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/bar').path(),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/baz').path(),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/baz').path(),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/baz').path(),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/foo').path(),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/foo').path(),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: fixturePath.append('./packages/foo').path(),
          },
        ]);
      });

      it('errors if workspaces config is empty', async () => {
        await expect(() => {
          context.workspaces = [];

          return routine.execute(context);
        }).rejects.toThrowErrorMatchingSnapshot();
      });
    });
  });
});
