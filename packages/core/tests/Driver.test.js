import { Tool } from 'boost';
import Driver from '../src/Driver';
import { createDriver } from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('Driver', () => {
  let driver;

  beforeEach(() => {
    driver = createDriver('foo', new Tool());
  });

  it('validates options', () => {
    expect(() => {
      driver = new Driver({
        args: true,
      });
    }).toThrowError('Invalid Driver option "args". Must be an array.');
  });

  describe('formatConfig()', () => {
    it('formats to JSON', () => {
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
    it('returns passed options', () => {
      driver.options.args = ['--foo'];

      expect(driver.getArgs()).toEqual(['--foo']);
    });
  });

  describe('getDependencies()', () => {
    it('returns both option and metadata dependencies', () => {
      driver.metadata.dependencies = ['foo'];
      driver.options.dependencies = ['bar'];

      expect(driver.getDependencies()).toEqual(['foo', 'bar']);
    });
  });

  describe('getSupportedOptions()', () => {
    it('returns an array of options', () => {
      expect(driver.getSupportedOptions()).toEqual([]);
    });
  });

  describe('handleFailure()', () => {
    it('logs stdout', () => {
      driver.handleFailure({
        stdout: 'out',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('out');
    });

    it('logs stderr', () => {
      driver.handleFailure({
        stderr: 'error',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('error');
    });

    it('logs stderr over stdout', () => {
      driver.handleFailure({
        stderr: 'error',
        stdout: 'out',
      });

      expect(driver.tool.logError).toHaveBeenCalledWith('error');
    });

    it('doesnt log if empty', () => {
      driver.handleFailure({
        stderr: '',
        stdout: '',
      });

      expect(driver.tool.logError).not.toHaveBeenCalled();
    });
  });

  describe('handleSuccess()', () => {
    it('logs stdout', () => {
      driver.handleSuccess({
        stdout: 'out',
      });

      expect(driver.tool.log).toHaveBeenCalledWith('out');
    });

    it('doesnt log stdout if empty', () => {
      driver.handleSuccess({
        stdout: '',
      });

      expect(driver.tool.log).not.toHaveBeenCalledWith();
    });

    it('doesnt log stderr', () => {
      driver.handleFailure({
        stderr: 'error',
      });

      expect(driver.tool.log).not.toHaveBeenCalled();
    });

    it('doesnt log if empty', () => {
      driver.handleFailure({
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
        driver.setCommandOptions({
          foo: {
            alias: 123,
          },
        });
      }).toThrowError(
        'Invalid Driver option "foo.alias". Type must be one of: String, Array<String>',
      );
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
        driver.setCommandOptions({
          foo: {
            description: 123,
          },
        });
      }).toThrowError('Invalid Driver option "foo.description". Must be a string.');
    });

    it('doesnt support empty descriptions', () => {
      expect(() => {
        driver.setCommandOptions({
          foo: {
            description: '',
          },
        });
      }).toThrowError('Invalid Driver option "foo.description". String cannot be empty.');
    });

    it('requires a description', () => {
      expect(() => {
        driver.setCommandOptions({
          foo: {},
        });
      }).toThrowError(
        'Invalid Driver option "foo.description". Field is required and must be defined.',
      );
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
        }).toThrowError('Invalid Driver option "bin". Field is required and must be defined.');
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
        }).toThrowError(
          'Invalid Driver option "bin". String does not match pattern "^[-a-z0-9]+$".',
        );
      });

      it('doesnt support uppercase', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            bin: 'Foo_123',
          });
        }).toThrowError(
          'Invalid Driver option "bin". String does not match pattern "^[-a-z0-9]+$".',
        );
      });
    });

    describe('configName', () => {
      it('is required', () => {
        expect(() => {
          driver.setMetadata({
            bin: 'beemo',
          });
        }).toThrowError(
          'Invalid Driver option "configName". Field is required and must be defined.',
        );
      });

      it('doesnt support non-strings', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            configName: 123,
          });
        }).toThrowError('Invalid Driver option "configName". Must be a string.');
      });
    });

    describe('title', () => {
      it('is required', () => {
        expect(() => {
          driver.setMetadata({
            bin: 'beemo',
            configName: 'beemo',
          });
        }).toThrowError('Invalid Driver option "title". Field is required and must be defined.');
      });

      it('doesnt support non-strings', () => {
        expect(() => {
          driver.setMetadata({
            ...options,
            title: 123,
          });
        }).toThrowError('Invalid Driver option "title". Must be a string.');
      });
    });
  });
});
