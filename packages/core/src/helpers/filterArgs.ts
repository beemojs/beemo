import { Argv } from '../types';

export type OptionMap = Record<string, boolean>;

export interface FilterArgOptions {
	allow?: OptionMap;
	block?: OptionMap;
}

export function filterArgs(argv: Argv, { allow, block }: FilterArgOptions) {
	const filteredArgv: Argv = [];
	const unknownArgv: Argv = [];
	const isInvalid = (option: string) => (allow && !allow[option]) || block?.[option];
	let skipNext = false;

	argv.forEach((arg, i) => {
		if (skipNext) {
			skipNext = false;

			return;
		}

		if (arg.startsWith('-')) {
			let option = arg;
			const nextArg = argv[i + 1];

			// --opt=123
			if (option.includes('=')) {
				[option] = option.split('=');

				if (isInvalid(option)) {
					unknownArgv.push(arg);

					return;
				}

				// --opt 123
			} else if (isInvalid(option)) {
				unknownArgv.push(arg);

				if (nextArg && !nextArg.startsWith('-')) {
					skipNext = true;
					unknownArgv.push(nextArg);
				}

				return;
			}
		}

		filteredArgv.push(arg);
	});

	return {
		filteredArgv,
		unknownArgv,
	};
}
