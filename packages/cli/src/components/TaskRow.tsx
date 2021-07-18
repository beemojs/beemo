/* eslint-disable no-magic-numbers */

import React from 'react';
import { Box } from 'ink';
import { Style } from '@boost/cli/react';
import { Task } from '@boost/pipeline';

export type UnknownTask = Task<unknown, unknown>;

export interface TaskRowProps {
	task: UnknownTask;
}

export function TaskRow({ task }: TaskRowProps) {
	return (
		<Box paddingLeft={task.depth + (task.depth > 0 ? 5 : 0)}>
			<Style type="muted">{`└─ ${task.title}`}</Style>
		</Box>
	);
}
