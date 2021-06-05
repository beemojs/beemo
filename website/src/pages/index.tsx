/* eslint-disable import/no-unresolved, react/jsx-no-literals, react/no-array-index-key */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

interface FeatureProps {
	title: string;
	description: React.ReactNode;
	imageUrl?: string;
}

const features: FeatureProps[][] = [
	[
		{
			title: '🌐 Centralized configuration',
			description: (
				<>
					All your tooling and configuration in a centralized location. Maintain once, install and
					re-use everywhere.
				</>
			),
		},
		{
			title: '🤖 Pragmatic drivers',
			description: (
				<>
					Streamlined and deterministic tooling for popular projects in the frontend ecosystem, like
					Babel, ESLint, Jest, TypeScript, and many more.
				</>
			),
		},
		{
			title: '🗂 Workspaces support',
			description: (
				<>
					First-class support for executing drivers and commands across workspaces (monorepos) in a
					consistent fashion.
				</>
			),
		},
	],
	[
		{
			title: '🧩 Typed configuration',
			description: (
				<>
					Instead of configuring drivers with JSON, YAML, or JavaScript, use TypeScript. Ensure your
					tooling is setup correctly with robust type-safety.
				</>
			),
		},
		{
			title: '⚡️ Dynamic strategies',
			description: (
				<>
					Generate driver config files at runtime using custom CLI arguments and one of many
					efficient strategies: created, referenced, copied, manually templated, and more.
				</>
			),
		},
		{
			title: '🏗 Template scaffolding',
			description: (
				<>
					Encapsulate common files and patterns into templates that can be easily scaffolded into
					new or existing projects.
				</>
			),
		},
	],
];

function Feature({ imageUrl, title, description }: FeatureProps) {
	const imgUrl = useBaseUrl(imageUrl);

	return (
		<div className={clsx('col col--4', styles.feature)}>
			{imgUrl && (
				<div className="text--center">
					<img alt={title} className={styles.featureImage} src={imgUrl} />
				</div>
			)}

			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

export default function Home() {
	const context = useDocusaurusContext() as { siteConfig: { tagline: string; title: string } };
	const siteConfig = context.siteConfig || {};

	return (
		<Layout description={siteConfig.tagline} title="Centralized development config">
			<header className={clsx('hero hero--primary', styles.heroBanner)}>
				<div className="container">
					<h1 className="hero__title">{siteConfig.title}</h1>
					<p className="hero__subtitle">{siteConfig.tagline}</p>
					<div className={styles.buttons}>
						<Link
							className={clsx('button button--secondary button--lg', styles.getStarted)}
							to={useBaseUrl('docs/')}
						>
							Get started
						</Link>

						<iframe
							frameBorder="0"
							scrolling="0"
							src="https://ghbtns.com/github-btn.html?user=beemojs&repo=beemo&type=star&count=true&size=large"
							title="GitHub"
						/>
					</div>
				</div>
			</header>

			<main>
				{features.map((items, i) => (
					<section key={i} className={styles.features}>
						<div className="container">
							<div className="row">
								{items.map((props, x) => (
									<Feature key={x} {...props} />
								))}
							</div>
						</div>
					</section>
				))}
			</main>
		</Layout>
	);
}
