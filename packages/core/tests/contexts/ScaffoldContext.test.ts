import ScaffoldContext from '../../src/contexts/ScaffoldContext';
import { stubScaffoldArgs } from '../../src/test';

describe('ScaffoldContext', () => {
  let context: ScaffoldContext;

  beforeEach(() => {
    context = new ScaffoldContext(stubScaffoldArgs({ dry: true }), 'gen', 'act', 'name');
  });

  it('sets params', () => {
    expect(context.generator).toBe('gen');
    expect(context.action).toBe('act');
    expect(context.name).toBe('name');
  });

  it('sets args', () => {
    expect(context.args).toEqual(stubScaffoldArgs({ dry: true }));
  });
});
