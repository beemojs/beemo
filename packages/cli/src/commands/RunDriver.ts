import {
  Blueprint,
  Driver,
  DriverContextOptions,
  DriverContextParams,
  Predicates,
} from '@beemo/core';
import {
  Arg,
  Argv,
  Command,
  CommandMetadata,
  Config,
  GlobalOptions,
  ParserOptions,
} from '@boost/cli';
import { beemo } from '../beemo';

export interface RunDriverConfig {
  driver?: Driver;
  parallelArgv?: Argv[];
}

@Config('run-driver', beemo.msg('app:cliCommandRunDriver'), {
  allowUnknownOptions: true,
  allowVariadicParams: true,
  category: 'core',
})
export default class RunDriver extends Command<
  DriverContextOptions & GlobalOptions,
  [],
  RunDriverConfig
> {
  @Arg.Number(beemo.msg('app:cliOptionConcurrency'))
  concurrency: number = 0;

  @Arg.Flag(beemo.msg('app:cliOptionGraph'))
  graph: boolean = true;

  @Arg.String(beemo.msg('app:cliOptionStdio'), { choices: ['buffer', 'stream', 'inherit'] })
  stdio: string = 'buffer';

  @Arg.String(beemo.msg('app:cliOptionWorkspaces'))
  workspaces: string = '';

  @Arg.Params<DriverContextParams>({
    description: beemo.msg('app:cliArgDriverName'),
    label: 'name',
    required: true,
    type: 'string',
  })
  async run(name: string = '') {
    const pipeline = beemo.createRunDriverPipeline(
      this.getArguments(),
      this.options.driver?.getName() || name,
    );

    await pipeline.run();
  }

  blueprint({ instance, array, string }: Predicates): Blueprint<RunDriverConfig> {
    return {
      // @ts-expect-error Because Driver is abstract
      driver: instance(Driver),
      parallelArgv: array(array(string())),
    };
  }

  getMetadata(): CommandMetadata {
    const { driver } = this.options;
    const parent = super.getMetadata();

    if (!driver) {
      return parent;
    }

    return {
      ...super.getMetadata(),
      category: 'driver',
      description:
        driver.metadata.description || beemo.msg('app:run', { title: driver.metadata.title }),
      params: [],
      path: driver.getName(),
    };
  }

  getParserOptions(): ParserOptions<DriverContextOptions & GlobalOptions> {
    const { driver } = this.options;
    const parent = super.getParserOptions();

    if (!driver) {
      return parent;
    }

    return {
      ...parent,
      options: {
        ...parent.options,
        ...driver.command,
      },
    };
  }
}
