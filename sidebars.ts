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
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/docker-provider',
        'architecture/security-model',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/python-sdk',
        'guides/typescript-sdk',
        'guides/framework-integration',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['api-reference'],
    },
    'roadmap',
    {
      type: 'link',
      label: 'Castor (Security Kernel)',
      href: 'https://substratum-labs.github.io/castor-docs/',
    },
  ],
};

export default sidebars;
