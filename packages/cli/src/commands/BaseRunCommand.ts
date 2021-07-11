import { Arg, Command, GlobalOptions, PrimitiveType } from '@boost/cli';
import { tool } from '../setup';

export abstract class BaseRunCommand<
	O extends object,
	P extends PrimitiveType[],
	C extends object = {},
> extends Command<GlobalOptions & O, P, C> {
	@Arg.Number(tool.msg('app:cliOptionConcurrency'))
	concurrency: number = 0;

	@Arg.Flag(tool.msg('app:cliOptionGraph'))
	graph: boolean = false;

	@Arg.String(tool.msg('app:cliOptionWorkspaces'))
	workspaces: string = '';
}
