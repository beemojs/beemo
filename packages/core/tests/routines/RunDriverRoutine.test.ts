/* eslint-disable jest/expect-expect */

import path from 'path';
import { getFixturePath } from '@boost/test-utils';
import RunDriverRoutine from '../../src/routines/RunDriverRoutine';
import { ExecuteCommandOptions } from '../../src/routines/driver/ExecuteCommandRoutine';
import Driver from '../../src/Driver';
import { mockDebugger, mockTool, mockDriver, stubDriverContext } from '../../src/testUtils';

describe('RunDriverRoutine', () => {
  let routine: RunDriverRoutine;
  let driver: Driver;

  function expectPipedRoutines(
    mock: any,
    tests: ({ key?: string; title: string } & ExecuteCommandOptions)[],
  ) {
    expect(mock).toHaveBeenCalledTimes(tests.length);

    tests.forEach((test, index) => {
      const { key = expect.anything(), title, ...options } = test;

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          key,
          title,
          options: expect.objectContaining({
            argv: ['-a', '--foo', 'bar', 'baz'],
            ...options,
          }),
        }),
      );
    });
  }

  beforeEach(() => {
    const tool = mockTool();

    driver = mockDriver('primary', tool);

    routine = new RunDriverRoutine('driver', 'Executing driver');
    routine.context = stubDriverContext(driver);
    routine.tool = tool;
    routine.debug = mockDebugger();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the primary driver', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expectPipedRoutines(routine.pipe, [{ title: 'primary -a --foo bar baz' }]);
    });

    it('adds multiple routines when parallel is used', () => {
      routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expectPipedRoutines(routine.pipe, [
        { title: 'primary -a --foo bar baz' },
        { title: 'primary -a --foo bar baz --one --two=2', additionalArgv: ['--one', '--two=2'] },
        { title: 'primary -a --foo bar baz --three -f', additionalArgv: ['--three', '-f'] },
      ]);
    });

    it('adds a routine if parallel is empty', () => {
      routine.context.parallelArgv = [];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expectPipedRoutines(routine.pipe, [{ title: 'primary -a --foo bar baz' }]);
    });

    describe('workspaces', () => {
      const fixturePath = getFixturePath('workspaces-driver');

      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.workspaceRoot = fixturePath;
        routine.context.cwd = fixturePath;
      });

      it('adds a routine for each', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expectPipedRoutines(routine.pipe, [
          {
            key: 'bar',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          },
        ]);
      });

      it('adds a routine for each when parallel is used', () => {
        routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
        routine.pipe = jest.fn();
        routine.bootstrap();

        expectPipedRoutines(routine.pipe, [
          {
            key: 'foo',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          },
          {
            key: 'foo',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          },
          {
            key: 'bar',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          },
          {
            key: 'bar',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          },
          {
            key: 'bar',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz',
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz --one --two=2',
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          },
          {
            key: 'baz',
            title: 'primary -a --foo bar baz --three -f',
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          },
        ]);
      });

      it('errors if workspaces config is not set', () => {
        expect(() => {
          delete routine.context.workspaces;
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });

      it('errors if workspaces config is empty', () => {
        expect(() => {
          routine.context.workspaces = [];
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
