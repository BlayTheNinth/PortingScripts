# Porting Scripts

- `node ./port.js <oldVersion> <newVersion> <mod>`: Creates a copy of `<mod>` from `<oldVersion>` inside `<newVersion>` and applies `<newVersion>/template.json` and  `<newVersion>/template/**/*` to it.
- `node ./update.js <version>`: Reapplies `<version>/template.json` (but not the template folder). Useful for updating mod loader versions after initial port.
- `update-all.bat <version>`: Runs `update.js` on all mods inside `<version>` (note: excludes 'Balm' and 'Kuma').
- `release.bat <version> <mod> [loader]`: Triggers `publish-release` workflow on GitHub. If `loader` is not specified, defaults to all loaders.
- `rename-branch.bat <version>`: Renames the checked out branches inside `<version>` to match their folder name. Useful for hotfix releases of Minecraft where old branch doesn't need to be kept.
- `make-default.bat <version>`: Sets default branches of all repos inside `<version>` to their corresponding version branch. Requires GitHub CLI (`gh`) to be installed and authenticated.