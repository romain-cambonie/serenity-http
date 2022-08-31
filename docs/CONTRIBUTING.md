# Prerequisites

- [Git](https://git-scm.com/) : Système de contrôle de versions distribué d'un ensemble de fichiers
- [Node](https://nodejs.org/) : Environnement d'exécution pour Javascript
- [Yarn](https://yarnpkg.com/) : Gestionnaire de paquets pour les produits développés dans des environnements Node

> Node et Yarn peuvent être installés via [nvm](https://github.com/nvm-sh/nvm) qui permet d'obtenir et d'utiliser rapidement différentes versions de Node via la ligne de commande.

# Project Installation

## 1. Clone

```shell
git clone git@github.com:romain-cambonie/serenity-http-client.git
```

## 2. Install dependencies

```shell
yarn
```

## 3. Husky

```
npx install husky
chmod a+x .husky/pre-commit
chmod a+x .husky/pre-push
```

### Execution right on hooks

If you see the warning :

```

```

hint: The '.husky/pre-commit' hook was ignored because it's not set as executable.
If the hooks do not have the 'execute' right you must add it.

Eg:

```shell
chmod a+x .husky/pre-commit
chmod a+x .husky/pre-push
```

# Contribution

## Nommage des branches

- Avant de créer une nouvelle branche de travail, récupérer les dernières modifications disponibles sur la branche `main`
- La nouvelle branche de travail doit ête préfixée par `build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `revert/`, `style/` ou `test/` en fonction du type de modification prévu, pour plus de détails à ce sujet, consulter [Conventional Commits cheat sheet](https://kapeli.com/cheat_sheets/Conventional_Commits.docset/Contents/Resources/Documents/index)
- Une branche portant une version à publier doit être de la forme `release/X.Y` avec `X.Y` égal au numéro de majeur et de mineur de la release, cela signifie donc que tous les patches sont à appliquer sur la même branche pour chaque version mineure. Cette organisation permet de gérer plusieurs versions de la bibliothèque en parallèle sans mettre en péril la rétrocompatibilité.

## Commits

### Convention

Les commits de ce repository doivent respecter la syntaxe décrite par la spécification des [Commits Conventionnels](https://www.conventionalcommits.org/fr)

### Signature

La branche `main`, ainsi que l'ensemble des branches de travail avec un préfixe valide requièrent que les commits soient signés :

- La documentation de GitHub indique comment [configurer la signature des commits](https://docs.github.com/en/enterprise-server@3.5/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- Les utilisateurs de [keybase](https://keybase.io/) peuvent [signer leurs commits avec leur clé GPG sur Keybase](https://stephenreescarter.net/signing-git-commits-with-a-keybase-gpg-key/)

## Publier sur la branche principale

- La branche principale est `main`, il n'est pas possible de publier en faisant un `push` depuis un dépôt local
- Il faut forcément créer une nouvelle branche de travail avec l'un préfixe autorisé
- À chaque publication sur une branche de travail, le workflow `Validate feature` sur [github actions](https://github.com/anct-cartographie-nationale/client-application/actions) vérifie
  - Qu'il est possible de créer un build sans erreur
  - Que la syntaxe correspond bien à ce qui est [défini par Prettier](https://github.com/anct-cartographie-nationale/client-base/blob/main/.prettierrc.cjson)
  - Que le code écrit en TypeScript respecte les conventions décrites par les [règles ESLint](https://github.com/anct-cartographie-nationale/client-base/blob/main/.eslintrc.json)
  - Que le style écrit en SCSS respecte les conventions décrites par les [règles Standard](https://github.com/anct-cartographie-nationale/client-base/blob/main/.stylelintrc.json)
  - Que les messages des commits suivent le standard établi par [Conventional Commits](https://www.conventionalcommits.org/fr)
- Une fois les développements terminés, il faut créer une [pull request](https://github.com/anct-cartographie-nationale/client-application/pulls) avec la banche de travail comme origin et la branche `main` comme destination.
- La pull request ne peut être fusionné que si :
  - Les étapes du workflow `Validate feature` sont valides
  - Les fichiers modifiés ont été revus par au moins une personne
  - Les commits ajoutés sont signés
- La branche de travail est supprimée automatiquement une fois qu'elle a été fusionnée

# Tooling setup

## Github actions

- Repository secrets to setup :
  - `NODE_AUTH_TOKEN`: NPM access token to publish on organisation [@serenity-dev](https://www.npmjs.com/org/serenity-dev)

# Releases

## NPM

- [npm](https://www.npmjs.com/) npm is the world's largest javascript software registry.
  - Organisation : [@serenity-dev](https://www.npmjs.com/org/serenity-dev)
  - Packages :
    - [CommonJS @serenity-dev/http-client](https://www.npmjs.com/package/@serenity-dev/http-client)
    - [EcmaScript @serenity-dev/http-client-esm](https://www.npmjs.com/package/@serenity-dev/http-client-esm)

## Github

# Tooling reference

## Eslint

Eslint configuration is in [.eslintrc.js](../.tooling/.eslint/.eslintrc.cjs)
Eslint ignore the resources referenced in [.eslintignore](../.tooling/.eslint/.eslintignore)
Rules directory is in [.eslint](../.tooling/.eslint)
Rules default configuration can be found here: TODO

## Prettier

Prettier configuration is in [.prettierrc.cjs](../.tooling/.prettier/.prettierrc.cjs)
Prettier ignore the resources referenced in [.prettierignore](../.tooling/.prettier/.prettierignore)

## Jest

Jest configuration is in [jest.config.ts](../.tooling/.jest/jest.config.ts)
[Documentation](https://jestjs.io/)

## Husky

### Configuration

Husky configuration is in [.husky](../.tooling/.husky)
[Documentation](https://typicode.github.io/husky/#/)

#### Pre-commit hook

Configuration: [pre-commit](../.husky/pre-commit)  
The pre-commit hook execute the `lint-staged` script

#### Pre-push hook

Configuration: [pre-push](../.husky/pre-push)  
The current configuration run

- yarn prettier:check => Check prettier on all files
- eslint ./\*\*/src/ => Check lint on all files in sources directories
- yarn test => Run all tests not needing dependencies

## Lint-staged

Configuration: [.lintstagedrc](../.tooling/.lintstaged/.lintstagedrc)
[Documentation](https://github.com/okonet/lint-staged)

The current configuration run the linter and prettier on 'staged' files (files where git has detected a modification).
