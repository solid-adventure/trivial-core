
# Trivial-Core Changelog

## 1.6.8
- Async functions do not trigger syntax errors in CodeCompletionGenerator

## 1.6.7
- bumps jwt dependencies to 9.0.0

## 1.6.6
- Updated non-breaking packages to address security warnings 
- Updated non-breaking webhook_relay template packages to address security warnings
- Bumped webhook_relay's gulp dependency to 5.0.0
- Removed kafka_consumer template

## 1.6.5
- Adds support for relating ActivityEntries to RegisterItems in trivial-api

## 1.6.4
- Adds support for using custom functions in action conditions
- Replaces 1.6.2 and 1.6.3, with slightly broken versions of this feature

## 1.6.1
- Switch to an unsigned cookie to support browser session handling, instead of only the Express server

## 1.6.0
- LUPIN_URL renamed to TRIVIAL_UI_URL

## 1.5.0
- AppBuilder.writeLocally accepts a path to override default

## 1.4.0
- AWS Lambdas now run on Node 18.x instead of Node 14.x

## 1.3.3
- ActionDescriptor can specify a condition that must be met for the action to run

## 1.3.2
- Adds support for saving an archived slug to the manifest API on build
- Adds support for creating an ActivityEntry to capture an app run
- Adds support for returning the output of the last action via manifest.app_entry_module = 'Thin'

## 1.3.1
- Adds support for pulling app slugs from GitHub

## 1.3.0
#### Note: Requires Node >=18.x, previously Node >=14.x

- Adds support for pushing app slugs to GitHub on build.
- Adds support for skipping AWS Lambda build via manifest.deploy_via = "aws_lambda"
- Adds support for external templates

## 1.2.4
Allow load before dynamic files have been generated

## 1.2.3
Remove example actions for Arka, Discord, Shopify & Whiplash

## 1.2.2
