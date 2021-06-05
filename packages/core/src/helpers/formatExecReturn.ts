export interface ExecLike {
	command?: string;
	stderr?: string;
	stdout?: string;
}

export function formatExecReturn<T extends ExecLike>(
	obj: T,
): Pick<T, Exclude<keyof T, 'command' | 'stderr' | 'stdout'>> {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	// Remove stdio for easier logging output
	const { command, stderr, stdout, ...rest } = obj;

	return rest;
}
