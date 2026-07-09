# Contributing to BinWatch

First off, thank you for considering contributing to BinWatch! It's people like you that make BinWatch such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) to see if someone else in the community has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork BinWatch and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-lora-support
```

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to ensure a clean, readable git history. Please adhere to this standard when committing.

Example commit messages:
* `feat: add support for ESP32 microcontrollers`
* `fix: resolve websocket connection drop on mobile`
* `docs: update hardware wiring diagram for HC-SR04`
* `style: improve contrast ratio on dashboard cards`
* `refactor: extract authentication middleware into separate module`

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and hardware assumptions.
3. You may merge the Pull Request in once you have the sign-off of at least one other developer, or if you do not have permission to do that, you may request the maintainer to merge it for you.

## Development Environment Setup

1. Clone your fork.
2. Run `npm install` in the root directory.
3. Copy `.env.example` to `.env` and fill in your test credentials (MongoDB, Resend, Google Maps).
4. Run `npm run dev` to start the local server with hot-reloading.

Thank you for contributing!
