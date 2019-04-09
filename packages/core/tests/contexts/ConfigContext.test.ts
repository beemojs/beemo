import ConfigContext from '../../src/contexts/ConfigContext';
import { stubConfigArgs, mockDriver } from '../../src/testUtils';

describe('ConfigContext', () => {
  let context: ConfigContext;

  beforeEach(() => {
    context = new ConfigContext(stubConfigArgs());
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new ConfigContext(stubConfigArgs({ names: ['*'] }));

      expect(context.args).toEqual(stubConfigArgs({ names: ['*'] }));
    });
  });

  describe('addDriverDependency()', () => {
    it('adds a driver', () => {
      expect(Array.from(context.drivers)).toEqual([]);

      const driver = mockDriver('test');

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
