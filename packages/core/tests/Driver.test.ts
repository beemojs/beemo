import Driver from '../src/Driver';
import { mockDriver, stubExecResult } from '../src/testUtils';

describe('Driver', () => {
  let driver: Driver;

  beforeEach(() => {
    driver = mockDriver('foo');
  });

  it('validates fields', () => {
    expect(() => {
      // @ts-ignore Test invalid type
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
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(driver.tool, 'logError');
    });

    it('logs stdout', () => {
      driver.handleFailure(
        stubExecResult({
          stdout: 'out',
        }),
      );

      expect(spy).toHaveBeenCalledWith('out');
    });

    it('logs stderr', () => {
      driver.handleFailure(
        stubExecResult({
          stderr: 'error',
        }),
      );

      expect(spy).toHaveBeenCalledWith('error');
    });

    it('logs stderr over stdout', () => {
      driver.handleFailure(
        stubExecResult({
          stderr: 'error',
          stdout: 'out',
        }),
      );

      expect(spy).toHaveBeenCalledWith('error');
    });

    it('doesnt log if empty', () => {
      driver.handleFailure(
        stubExecResult({
          stderr: '',
          stdout: '',
        }),
      );

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleSuccess()', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(driver.tool, 'log');
    });

    it('logs stdout', () => {
      driver.handleSuccess(
        stubExecResult({
          stdout: 'out',
        }),
      );

      expect(spy).toHaveBeenCalledWith('out');
    });

    it('doesnt log stdout if empty', () => {
      driver.handleSuccess(
        stubExecResult({
          stdout: '',
        }),
      );

      expect(spy).not.toHaveBeenCalledWith();
    });

    it('doesnt log stderr', () => {
      driver.handleFailure(
        stubExecResult({
          stderr: 'error',
        }),
      );

      expect(spy).not.toHaveBeenCalled();
    });

    it('doesnt log if empty', () => {
      driver.handleFailure(
        stubExecResult({
          stderr: '',
          stdout: '',
        }),
      );

      expect(spy).not.toHaveBeenCalled();
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
        driver.setCommandOptions({
          foo: {
            // @ts-ignore
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
        }).toThrowError();
        // Broken in Node 8
        // }).toThrowErrorMatchingSnapshot();
      });

      it('doesnt support uppercase', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'Foo_123',
          });
        }).toThrowError();
        // Broken in Node 8
        // }).toThrowErrorMatchingSnapshot();
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
          driver.setMetadata({
            ...options,
            // @ts-ignore
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
          driver.setMetadata({
            ...options,
            // @ts-ignore
            title: 123,
          });
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
