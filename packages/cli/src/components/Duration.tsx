import React from 'react';
import { Style } from '@boost/cli';
import { formatMs } from '@boost/common';

export interface DurationProps {
	time: number;
}

export function Duration({ time }: DurationProps) {
	return <Style type="muted">{`(${formatMs(time)})`}</Style>;
}
