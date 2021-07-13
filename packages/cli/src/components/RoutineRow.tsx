/* eslint-disable no-nested-ternary */

import React from 'react';
import { Box } from 'ink';
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
		<Box paddingLeft={routine.depth}>
			<Box>
				<Style bold type={status}>
					{routine.key.toUpperCase()}
				</Style>
			</Box>

			<Box marginLeft={1}>{routine.title}</Box>

			{routine.isComplete() && (
				<Box marginLeft={1}>
					<Duration time={routine.stopTime - routine.startTime} />
				</Box>
			)}
		</Box>
	);
}
