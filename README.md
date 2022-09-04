# Serenity Http Client

# EXPERIMENTAL: NOT READY FOR PRODUCTION USE !

## About

Serenity Http Client aim to provide a target based http client that manage common use cases out of the box and provide powerful tooling for complex use cases.

## Table of contents

- 🪧 [About](#about)
- 🚀 [Installation](#installation)
- 🛠️ [Usage](#usage)
- 🤝 [Contribution](#contribution)
- 🏗️ [Built With](#built-with)
- 📝 [Licence](#licence)

## Installation

```
npm install @serenity-dev/http-client
```

## Usage

### Gateway example

#### Target definition

#### Http to Domain error mapping

#### Adapter / Target configuration

#### Custom Request Interceptor

#### Custom Error Interceptor

#### Schema Validation / Typeguard

#### Retryable errors

####

## Contribution

To setup the project locally see the [contributing guide](docs/CONTRIBUTING.md)

## Built With

### Langages & Frameworks

- [TypeScript](https://www.typescriptlang.org/) Strongly typed programming language that builds on JavaScript

### Tools

#### CLI

- [Jest](https://jestjs.io/) framework to run automated tests.
  - Configuration: [.tooling/.eslint/.eslintrc.cjs](.tooling/.eslint/.eslintrc.cjs)
- [Eslint](https://eslint.org/) Static code analyzer to find syntax problems.
  - Configuration: [.tooling/.eslint/.eslintrc.cjs](.tooling/.eslint/.eslintrc.cjs)
  - Local Documentation: [.tooling/.eslint/.eslintrc.cjs](.tooling/.eslint/.eslintrc.cjs)
- [Prettier](https://prettier.io/) Opinionated code formatter.
  - Configuration: [.tooling/.prettier/.prettierrc.cjs](.tooling/.prettier/.prettierrc.cjs)
- [Husky](https://typicode.github.io/husky/#/) Modern native git hooks. Used for quality check on commit and push.
  - Configuration: [.husky](.husky)
  - Local documentation: [.husky.md](.husky/husky.md)
- [Commitlint](https://github.com/conventional-changelog/commitlint) checks if your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).
  - Configuration: [.tooling/.commitlint/commitlint.config.cjs](.tooling/.commitlint/commitlint.config.cjs)
- [Lint-staged](https://github.com/okonet/lint-staged) execute commands on staged files.
  - Configuration: [.tooling/.lint-staged/.lintstagedrc](.tooling/.lint-staged/.lintstagedrc)
- [Concurrently](https://github.com/open-cli-tools/concurrently) Used to parallelize commands execution.

#### CI/CD

- [Github Actions](https://docs.github.com/en/actions)
- [Semantic release](https://github.com/semantic-release/semantic-release) Automates the whole package release workflow.
  - Configuration: [.tooling/.semantic-release/.semantic-release.config.cjs](.tooling/.semantic-release/.semantic-release.config.cjs)

## License

See the [LICENSE.md](docs/LICENSE.md) file.
