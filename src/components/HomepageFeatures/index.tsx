import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'AI-Safe Defaults',
    icon: '\u{1F6E1}',
    description: (
      <>
        Network disabled, filesystem readonly, 300s timeout — enforced out of
        the box. Security you don't have to remember to configure.
      </>
    ),
  },
  {
    title: 'Multi-Provider',
    icon: '\u{1F50C}',
    description: (
      <>
        Docker, Firecracker, and WASM behind a single unified API. Switch
        providers with one line — your agent code stays the same.
      </>
    ),
  },
  {
    title: 'N+M Unification',
    icon: '\u{1F9E9}',
    description: (
      <>
        Eliminates the N×M integration problem. Frameworks connect to Roche
        once; providers plug in once. Everyone benefits.
      </>
    ),
  },
  {
    title: 'CLI + SDKs',
    icon: '\u{1F4E6}',
    description: (
      <>
        First-class Python, TypeScript, and Rust SDKs plus the{' '}
        <code>roche</code> CLI. Use the interface that fits your workflow.
      </>
    ),
  },
  {
    title: 'Framework-Agnostic',
    icon: '\u{1F916}',
    description: (
      <>
        Works with LangChain, CrewAI, AutoGen, OpenAI Agents SDK, Anthropic
        API, and Camel-AI. No vendor lock-in.
      </>
    ),
  },
  {
    title: 'Zero Config',
    icon: '\u{26A1}',
    description: (
      <>
        Sensible defaults, three-method API: <code>create</code>,{' '}
        <code>exec</code>, <code>destroy</code>. Running sandboxed code in
        under 5 lines.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{marginBottom: '2rem'}}>
        <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
