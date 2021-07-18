/* eslint-disable no-magic-numbers */

import React from 'react';
import { Box } from 'ink';
import { DriverOutputStrategy } from '@beemo/core';
import { Style } from '@boost/cli/react';
import { Task } from '@boost/pipeline';

export type UnknownTask = Task<unknown, unknown>;

export interface TaskRowProps {
	task: UnknownTask;
	outputStrategy: DriverOutputStrategy;
}

export function TaskRow({ task, outputStrategy }: TaskRowProps) {
	return (
		<Box paddingLeft={task.depth + (task.depth > 0 ? 5 : 0)}>
			<Style type="muted">{`└─ ${
				(outputStrategy === 'buffer' ? task.statusText : '') || task.title
			}`}</Style>
		</Box>
	);
}
