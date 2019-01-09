import ConfigContext from '../../src/contexts/ConfigContext';
import Driver from '../../src/Driver';
import { MOCK_CONFIG_ARGS } from '../../../../tests/helpers';

describe('ConfigContext', () => {
  let context: ConfigContext;

  beforeEach(() => {
    context = new ConfigContext({ ...MOCK_CONFIG_ARGS });
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new ConfigContext({ ...MOCK_CONFIG_ARGS, name: '*' });

      expect(context.args).toEqual({ ...MOCK_CONFIG_ARGS, name: '*' });
    });
  });

  describe('addDriverDependency()', () => {
    it('adds a driver', () => {
      expect(Array.from(context.drivers)).toEqual([]);

      const driver = new Driver();

      context.addDriverDependency(driver);

      expect(Array.from(context.drivers)).toEqual([driver]);
    });

    it('errors when not a driver', () => {
      expect(() => {
        // @ts-ignore Allow invalid type
        context.addDriverDependency(true);
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
