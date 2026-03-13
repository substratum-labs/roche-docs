import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Roche',
  tagline: 'Universal Sandbox Orchestrator for AI Agents',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://substratum-labs.github.io',
  baseUrl: '/roche-docs/',

  organizationName: 'substratum-labs',
  projectName: 'roche-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/substratum-labs/roche-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Roche',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/substratum-labs/roche',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started'},
            {label: 'Architecture', to: '/docs/architecture'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {
              label: 'Castor',
              href: 'https://substratum-labs.github.io/castor-docs/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/substratum-labs/roche',
            },
          ],
        },
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} Substratum Labs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'python', 'toml', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
