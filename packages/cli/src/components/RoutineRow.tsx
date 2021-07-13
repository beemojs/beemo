/* eslint-disable no-magic-numbers */
/* eslint-disable no-nested-ternary */

import React from 'react';
import { Box, Text } from 'ink';
import { Style } from '@boost/cli';
import { Routine } from '@boost/pipeline';
import { Duration } from './Duration';

export type UnknownRoutine = Routine<unknown, unknown>;

export interface RoutineRowProps {
	routine: UnknownRoutine;
}

export function RoutineRow({ routine }: RoutineRowProps) {
	const status = routine.hasPassed()
		? 'success'
		: routine.hasFailed()
		? 'failure'
		: routine.isSkipped()
		? 'warning'
		: 'muted';

	return (
		<Box paddingLeft={routine.depth * 2 + (routine.depth > 0 ? 4 : 0)}>
			{routine.depth === 0 && (
				<Box marginRight={1}>
					<Style type="muted">{`[${routine.index + 1}]`}</Style>
				</Box>
			)}

			<Box>
				<Style bold type={status}>
					{routine.key.toUpperCase()}
				</Style>
			</Box>

			<Box marginLeft={1}>
				<Text>{routine.title}</Text>
			</Box>

			{(routine.isComplete() || routine.isRunning()) && (
				<Box marginLeft={1}>
					<Duration time={(routine.stopTime || Date.now()) - routine.startTime} />
				</Box>
			)}
		</Box>
	);
}
