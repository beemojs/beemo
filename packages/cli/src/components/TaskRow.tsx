import React from 'react';
import { Box } from 'ink';
import { Style } from '@boost/cli';
import { Task } from '@boost/pipeline';

export type UnknownTask = Task<unknown, unknown>;

export interface TaskRowProps {
	task: UnknownTask;
}

export function TaskRow({ task }: TaskRowProps) {
	return (
		<Box paddingLeft={task.depth * 2}>
			<Style bold type="muted">
				{`[${task.index + 1}] ${task.title}`}
			</Style>
		</Box>
	);
}
