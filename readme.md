
# Trivial-Core
Trivial core builds event-processing apps from templates.

## Local Development
If you're making changes to this package while working on a project that imports this library, you'll want to link your project to the local version. This will let you use the unpublished version, without pushing to npm and re-installing.

Make a global link to the local package directory:
```shell
cd ./trivial-core
```

In your example project, link to the unpublished version:
```shell
npm link ../trivial-core/
```

Install into your example app:
```shell
npm install trivial-core --package-lock-only
```

## Publishing
Bump the version following the [symantic versioning spec](https://docs.npmjs.com/about-semantic-versioning). Commit and push. Then:

```shell
npm publish
```