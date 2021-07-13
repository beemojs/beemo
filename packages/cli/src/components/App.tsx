import React, { useCallback, useEffect, useState } from 'react';
import { Static } from 'ink';
import { DriverOutputStrategy } from '@beemo/core';
import { useProgram, useRenderLoop } from '@boost/cli';
import { AnyWorkUnit, Context, Monitor, Routine, SerialPipeline, Task } from '@boost/pipeline';
import { tool } from '../setup';
import { RoutineRow, UnknownRoutine } from './RoutineRow';

export interface AppProps {
	pipeline: SerialPipeline<{}, Context, unknown, unknown>;
	outputStrategy?: DriverOutputStrategy;
}

const monitor = new Monitor();

export function App({ pipeline, outputStrategy }: AppProps) {
	const { exit } = useProgram();
	const [workUnits, setWorkUnits] = useState<Set<AnyWorkUnit>>(new Set());
	const [finishedRoutines, setFinishedRoutines] = useState<UnknownRoutine[]>([]);
	const clearLoop = useRenderLoop();

	// Monitor for pipeline updates
	const handleRunWorkUnit = useCallback((workUnit: AnyWorkUnit) => {
		setWorkUnits((prev) => {
			const set = new Set(prev);
			set.add(workUnit);
			return set;
		});
	}, []);

	const handleFinishWorkUnit = useCallback((workUnit: AnyWorkUnit) => {
		if (workUnit.depth === 0) {
			setFinishedRoutines((prev) => [...prev, workUnit as UnknownRoutine]);
		}

		setWorkUnits((prev) => {
			const set = new Set(prev);
			set.delete(workUnit);
			return set;
		});
	}, []);

	useEffect(() => {
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

	// Hide output if strategy is "none"
	if ((outputStrategy || tool.config.execute.output) === 'none') {
		return null;
	}

	// Group based on type
	const routines = [...workUnits].filter((unit) => unit instanceof Routine) as UnknownRoutine[];
	const tasks = [...workUnits].filter((unit) => unit instanceof Task);

	return (
		<>
			<Static items={finishedRoutines}>
				{(routine) => <RoutineRow key={`static-${routine.id}`} routine={routine} />}
			</Static>

			{routines.map((routine) => (
				<RoutineRow key={routine.id} routine={routine} />
			))}
		</>
	);
}
