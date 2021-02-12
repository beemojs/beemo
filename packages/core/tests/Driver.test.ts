import execa from 'execa';
import Driver from '../src/Driver';
import { mockDriver, stubExecResult } from '../src/testing';

jest.mock('execa');

describe('Driver', () => {
  let driver: Driver;

  beforeEach(() => {
    driver = mockDriver('foo');
  });

  it('validates fields', () => {
    expect(() => {
      // @ts-expect-error Test invalid type
      driver = new Driver({
        args: true,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  describe('.validate()', () => {
    it('errors if no options object', () => {
      expect(() => {
        // @ts-expect-error
        Driver.validate({});
      }).toThrow('`Driver` requires an options object.');
    });
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
      driver.configure({ args: ['--foo'] });

      expect(driver.getArgs()).toEqual(['--foo']);
    });
  });

  describe('getDependencies()', () => {
    it('returns both field and metadata dependencies', () => {
      driver.metadata.dependencies = ['foo'];
      driver.configure({ dependencies: ['bar'] });

      expect(driver.getDependencies()).toEqual(['foo', 'bar']);
    });
  });

  describe('getSupportedOptions()', () => {
    it('returns an array of fields', () => {
      expect(driver.getSupportedOptions()).toEqual([]);
    });
  });

  describe('getVersion()', () => {
    it('returns 0.0.0 for an invalid response', () => {
      (execa.sync as jest.Mock).mockImplementation(() => ({ stdout: '' }));

      expect(driver.getVersion()).toBe('0.0.0');
      expect(execa.sync).toHaveBeenCalledWith('foo', ['--version']);
    });

    it('returns valid version from response', () => {
      (execa.sync as jest.Mock).mockImplementation(() => ({ stdout: '1.2.3' }));

      expect(driver.getVersion()).toBe('1.2.3');
    });
  });

  describe('processFailure()', () => {
    it('logs stdout', () => {
      driver.processFailure(
        stubExecResult({
          stdout: 'out',
        }),
      );

      expect(driver.output.stderr).toBe('out');
    });

    it('logs stderr', () => {
      driver.processFailure(
        stubExecResult({
          stderr: 'error',
        }),
      );

      expect(driver.output.stderr).toBe('error');
    });

    it('logs stderr over stdout', () => {
      driver.processFailure(
        stubExecResult({
          stderr: 'error',
          stdout: 'out',
        }),
      );

      expect(driver.output.stderr).toBe('error');
    });

    it('doesnt log if empty', () => {
      driver.processFailure(
        stubExecResult({
          stderr: '',
          stdout: '',
        }),
      );

      expect(driver.output.stdout).toBe('');
    });
  });

  describe('processSuccess()', () => {
    it('logs stdout', () => {
      driver.processSuccess(
        stubExecResult({
          stdout: 'out',
        }),
      );

      expect(driver.output.stdout).toBe('out');
    });

    it('doesnt log stdout if empty', () => {
      driver.processSuccess(
        stubExecResult({
          stdout: '',
        }),
      );

      expect(driver.output.stdout).toBe('');
    });

    it('doesnt log stderr', () => {
      driver.processSuccess(
        stubExecResult({
          stderr: 'error',
        }),
      );

      expect(driver.output.stderr).toBe('');
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

    it('replaces array if new value is not an array', () => {
      expect(driver.mergeConfig({ foo: [1, 2] }, { foo: 'bar' })).toEqual({ foo: 'bar' });
    });
  });

  describe('setCommandOptions()', () => {
    it('supports description as a string', () => {
      driver.setCommandOptions({
        foo: {
          description: 'Foo',
          type: 'string',
        },
      });

      expect(driver.command).toEqual({
        foo: {
          description: 'Foo',
          type: 'string',
        },
      });
    });

    it('doesnt support description as other types', () => {
      expect(() => {
        driver.setCommandOptions({
          foo: {
            // @ts-expect-error
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
            type: 'string',
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('requires a description', () => {
      expect(() => {
        driver.setCommandOptions({
          // @ts-expect-error
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
        }).not.toThrow();
      });

      it('doesnt support underscores', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'foo_123',
          });
        }).toThrow(
          'Invalid TestDriver field "bin". String does not match. (pattern "^[a-z]{1}[a-zA-Z0-9-]+$")',
        );
      });

      it('doesnt support uppercase', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'Foo_123',
          });
        }).toThrow(
          'Invalid TestDriver field "bin". String does not match. (pattern "^[a-z]{1}[a-zA-Z0-9-]+$")',
        );
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
            // @ts-expect-error
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
            // @ts-expect-error
            title: 123,
          });
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
