import { LernaConfig } from '@beemo/driver-lerna';

const config: LernaConfig = {
	version: 'independent',
	npmClient: 'yarn',
	useWorkspaces: true,
	command: {
		publish: {
			ignoreChanges: ['*.md', '*.test.ts'],
			message: 'Release [ci skip]',
		},
	},
};
export default config;
