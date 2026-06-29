/** @type {import('prettier').Config} */
const prettierConfig = {
  // Default to auto — respect file's own config
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  quoteProps: 'consistent',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  printWidth: 100,
  proseWrap: 'preserve',

  // Plugins
  plugins: ['prettier-plugin-tailwindcss'],

  // Override Tailwind plugin defaults
  tailwindConfig: './tailwind.config.ts',

  // File-specific overrides
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'preserve',
        printWidth: 80,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.sh', '*.bash'],
      options: {
        tabWidth: 4,
      },
    },
  ],
};

export default prettierConfig;
