import React, { useCallback, useEffect, useState } from 'react';
import { DriverOutputStrategy } from '@beemo/core';
import { AnyPipeline, AnyWorkUnit, Monitor } from '@boost/pipeline';
import { tool } from '../setup';

export interface AppProps {
	pipeline: AnyPipeline;
	outputStrategy?: DriverOutputStrategy;
}

const monitor = new Monitor();

export function App({ pipeline, outputStrategy }: AppProps) {
	const [workUnits, setWorkUnits] = useState<Set<AnyWorkUnit>>(new Set());
	const [finishedRoutines, setFinishedRoutines] = useState<AnyWorkUnit[]>([]);

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
			setFinishedRoutines((prev) => [...prev, workUnit]);
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

	// Hide output if strategy is "none"
	if ((outputStrategy || tool.config.execute.output) === 'none') {
		return null;
	}

	// Group based on type
	const routines = [...workUnits].filter((unit) => unit.depth === 0);
	const tasks = [...workUnits].filter((unit) => unit.depth > 0);

	return <div />;
}
