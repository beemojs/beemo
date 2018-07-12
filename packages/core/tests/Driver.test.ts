import { Tool } from 'boost';
import Driver from '../src/Driver';
import { createDriver } from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('Driver', () => {
  let driver: Driver<any>;
  const execReturn = {
    cmd: '',
    code: 0,
    failed: false,
    killed: false,
    signal: null,
    stderr: '',
    stdout: '',
    timedOut: false,
  };

  beforeEach(() => {
    driver = createDriver('foo', new Tool({}));
  });

  it('validates fields', () => {
    expect(() => {
      // @ts-ignore
      driver = new Driver({
        args: true,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  describe('formatConfig()', () => {
    it('formats to JSON if config ends in .json', () => {
      driver.metadata.configName = 'cfg.json';

      expect(
        driver.formatConfig({
          foo: 123,
          bar: 'abc',
          baz: true,
        }),
      ).toMatchSnapshot();
    });

    it('formats to JS if config ends in .js', () => {
      driver.metadata.configName = 'cfg.js';

      expect(
        driver.formatConfig({
          foo: 123,
          bar: 'abc',
          baz: true,
        }),
      ).toMatchSnapshot();
    });
  });

  describe('getArgs()', () => {
    it('returns passed fields', () => {
      driver.options.args = ['--foo'];

      expect(driver.getArgs()).toEqual(['--foo']);
    });
  });

  describe('getDependencies()', () => {
    it('returns both field and metadata dependencies', () => {
      driver.metadata.dependencies = ['foo'];
      driver.options.dependencies = ['bar'];

      expect(driver.getDependencies()).toEqual(['foo', 'bar']);
    });
  });

  describe('getSupportedOptions()', () => {
    it('returns an array of fields', () => {
      expect(driver.getSupportedOptions()).toEqual([]);
    });
  });

  describe('handleFailure()', () => {
    it('logs stdout', () => {
      driver.handleFailure({
        ...execReturn,
        stdout: 'out',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('out');
    });

    it('logs stderr', () => {
      driver.handleFailure({
        ...execReturn,
        stderr: 'error',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('error');
    });

    it('logs stderr over stdout', () => {
      driver.handleFailure({
        ...execReturn,
        stderr: 'error',
        stdout: 'out',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('error');
    });

    it('doesnt log if empty', () => {
      driver.handleFailure({
        ...execReturn,
        stderr: '',
        stdout: '',
      });

      expect(driver.tool.logError).not.toHaveBeenCalled();
    });
  });

  describe('handleSuccess()', () => {
    it('logs stdout', () => {
      driver.handleSuccess({
        ...execReturn,
        stdout: 'out',
      });

      expect(driver.tool.log).toHaveBeenCalledWith('out');
    });

    it('doesnt log stdout if empty', () => {
      driver.handleSuccess({
        ...execReturn,
        stdout: '',
      });

      expect(driver.tool.log).not.toHaveBeenCalledWith();
    });

    it('doesnt log stderr', () => {
      driver.handleFailure({
        ...execReturn,
        stderr: 'error',
      });

      expect(driver.tool.log).not.toHaveBeenCalled();
    });

    it('doesnt log if empty', () => {
      driver.handleFailure({
        ...execReturn,
        stderr: '',
        stdout: '',
      });

      expect(driver.tool.log).not.toHaveBeenCalled();
    });
  });

  describe('mergeConfig()', () => {
    it('deep merges objects', () => {
      expect(
        driver.mergeConfig(
          {
            foo: 123,
            bar: {
              baz: 'abc',
            },
          },
          {
            bar: {
              baz: 'xyz',
              qux: true,
            },
          },
        ),
      ).toEqual({
        foo: 123,
        bar: {
          baz: 'xyz',
          qux: true,
        },
      });
    });

    it('concats arrays', () => {
      expect(driver.mergeConfig({ foo: [1, 2] }, { foo: [3, 4] })).toEqual({ foo: [1, 2, 3, 4] });
    });
  });

  describe('on()', () => {
    it('pipes event to tool', () => {
      const func = () => {};

      driver.on('foo', func);

      expect(driver.tool.on).toHaveBeenCalledWith('foo', func);
    });
  });

  describe('setCommandOptions()', () => {
    it('supports alias as a string', () => {
      driver.setCommandOptions({
        foo: {
          alias: 'f',
          description: 'Foo',
        },
      });

      expect(driver.command).toEqual({
        foo: {
          alias: 'f',
          description: 'Foo',
        },
      });
    });

    it('supports alias as an array of strings', () => {
      driver.setCommandOptions({
        foo: {
          alias: ['f', 'o'],
          description: 'Foo',
        },
      });

      expect(driver.command).toEqual({
        foo: {
          alias: ['f', 'o'],
          description: 'Foo',
        },
      });
    });

    it('doesnt support alias as other types', () => {
      expect(() => {
        // @ts-ignore
        driver.setCommandOptions({
          foo: {
            alias: 123,
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('supports description as a string', () => {
      driver.setCommandOptions({
        foo: {
          description: 'Foo',
        },
      });

      expect(driver.command).toEqual({
        foo: {
          description: 'Foo',
        },
      });
    });

    it('doesnt support description as other types', () => {
      expect(() => {
        // @ts-ignore
        driver.setCommandOptions({
          foo: {
            description: 123,
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('doesnt support empty descriptions', () => {
      expect(() => {
        driver.setCommandOptions({
          foo: {
            description: '',
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('requires a description', () => {
      expect(() => {
        driver.setCommandOptions({
          foo: {},
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('setMetadata()', () => {
    const options = {
      bin: 'beemo',
      configName: 'beemo',
      title: 'Beemo',
    };

    describe('bin', () => {
      it('is required', () => {
        expect(() => {
          driver.setMetadata({});
        }).toThrowErrorMatchingSnapshot();
      });

      it('supports alpha, numeric, and dashes', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'foo-123',
          });
        }).not.toThrowError();
      });

      it('doesnt support underscores', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'foo_123',
          });
        }).toThrowErrorMatchingSnapshot();
      });

      it('doesnt support uppercase', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'Foo_123',
          });
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe('configName', () => {
      it('is required', () => {
        expect(() => {
          driver.setMetadata({
            bin: 'beemo',
          });
        }).toThrowErrorMatchingSnapshot();
      });

      it('doesnt support non-strings', () => {
        expect(() => {
          // @ts-ignore
          driver.setMetadata({
            ...options,
            configName: 123,
          });
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe('title', () => {
      it('is required', () => {
        expect(() => {
          driver.setMetadata({
            bin: 'beemo',
            configName: 'beemo',
          });
        }).toThrowErrorMatchingSnapshot();
      });

      it('doesnt support non-strings', () => {
        expect(() => {
          // @ts-ignore
          driver.setMetadata({
            ...options,
            title: 123,
          });
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
