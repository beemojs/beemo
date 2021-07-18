import React, { useCallback, useEffect, useState } from 'react';
import { Box, Static } from 'ink';
import { DriverOutputStrategy } from '@beemo/core';
import { useProgram, useRenderLoop } from '@boost/cli/react';
import { AnyWorkUnit, Context, Monitor, Routine, SerialPipeline, Task } from '@boost/pipeline';
import { tool } from '../setup';
import { RoutineRow, UnknownRoutine } from './RoutineRow';
import { TaskRow, UnknownTask } from './TaskRow';

export interface AppProps {
	pipeline: SerialPipeline<{}, Context, unknown, unknown>;
	outputStrategy?: DriverOutputStrategy;
}

export function App({ pipeline, outputStrategy }: AppProps) {
	const { exit } = useProgram();
	const [workUnits, setWorkUnits] = useState<Set<AnyWorkUnit>>(new Set());
	const [finishedRoutines, setFinishedRoutines] = useState<UnknownRoutine[]>([]);
	const clearLoop = useRenderLoop();
	const strategy = outputStrategy ?? tool.config.execute.output;

	// Monitor for pipeline updates
	const handleRunWorkUnit = useCallback((workUnit: AnyWorkUnit) => {
		setWorkUnits((prev) => {
			const set = new Set(prev);
			set.add(workUnit);
			return set;
		});
	}, []);

	const handleFinishWorkUnit = useCallback((workUnit: AnyWorkUnit) => {
		if (workUnit instanceof Routine && workUnit.depth === 0) {
			setFinishedRoutines((prev) => [...prev, workUnit as UnknownRoutine]);
		}

		setWorkUnits((prev) => {
			const set = new Set(prev);
			set.delete(workUnit);
			return set;
		});
	}, []);

	useEffect(() => {
		const monitor = new Monitor();
		monitor.onWorkUnitRun.listen(handleRunWorkUnit);
		monitor.onWorkUnitPass.listen(handleFinishWorkUnit);
		monitor.onWorkUnitFail.listen(handleFinishWorkUnit);
		monitor.monitor(pipeline);
	}, [handleRunWorkUnit, handleFinishWorkUnit, pipeline]);

	// Start the pipeline on mount
	useEffect(() => {
		async function run() {
			try {
				await pipeline.run();
			} catch (error: unknown) {
				exit(error as Error);
			} finally {
				clearLoop();
			}
		}

		void run();
	}, [clearLoop, exit, pipeline]);

	// Hide Beemo output but not driver output
	if (strategy === 'none' || strategy === 'stream') {
		return null;
	}

	// Group based on type
	const routines = [...workUnits].filter(
		(unit) => unit instanceof Routine && !unit.isSkipped(),
	) as UnknownRoutine[];

	const tasks = [...workUnits].filter(
		(unit) => unit instanceof Task && unit.isRunning(),
	) as UnknownTask[];

	return (
		<>
			<Static items={finishedRoutines}>
				{(routine) => <RoutineRow key={`static-${routine.id}-${routine.key}`} routine={routine} />}
			</Static>

			<Box flexDirection="column">
				{routines.map((routine) => (
					<RoutineRow key={`routine-${routine.id}-${routine.key}`} routine={routine} />
				))}

				{tasks.map((task) => (
					<TaskRow key={`task-${task.id}-${task.title}`} task={task} />
				))}
			</Box>
		</>
	);
}
