import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quickstart',
        'getting-started/concepts',
      ],
    },
    'architecture',
    'security-defaults',
    'providers',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/python-sdk',
        'guides/typescript-sdk',
        'guides/framework-integration',
      ],
    },
    'api-reference',
    'roadmap',
    {
      type: 'link',
      label: 'Castor (Microkernel)',
      href: 'https://substratum-labs.github.io/castor-docs/',
    },
  ],
};

export default sidebars;
