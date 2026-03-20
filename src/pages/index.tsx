import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          One API to rule sandbox providers. Roche gives AI agents isolated,
          secure code execution across Docker, Firecracker, and WASM — with
          AI-safe defaults out of the box.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quickstart">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/substratum-labs/roche"
            style={{marginLeft: '1rem', color: 'white', borderColor: 'white'}}>
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function CodePreview() {
  return (
    <section className={styles.codePreview}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className="text--center" style={{marginBottom: '1.5rem'}}>
              Sandbox in 5 Lines
            </Heading>
            <pre className={styles.codeBlock}>
              <code>{`from roche_sandbox import Roche

roche = Roche()

with roche.create(image="python:3.12-slim") as sandbox:
    output = sandbox.exec(["python3", "-c", "print('Hello from Roche!')"])
    print(output.stdout)  # Hello from Roche!
# sandbox auto-destroyed — network was off, fs was readonly`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Universal Sandbox Orchestrator for AI Agents"
      description="Roche provides a single abstraction over multiple sandbox providers with AI-optimized security defaults — network disabled, filesystem readonly, timeout enforced.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <CodePreview />
      </main>
    </Layout>
  );
}
