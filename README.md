# gh-project-v2-add-item

A script to add github issues to v2 projects

:warning: This is extremely manual and untested, so use at your own risk :smile:

## To configure

### Setup base graphQL config

The `utils.ts` file contains a `graphql` request wrapper method that is used across the scripts to call the github graphQL endpoint.  Update this script with your `org`, `repo`, `projectId` and `projectNumber`.

You can find the `projectId` from the `org` and `projectNumber` by using the [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer).

```graphql
query {
  organization(login: "elastic") {
    projectV2(number: 1141) {
      id
    }
  }
}
```

### Setup the GitHub token

The `graphql` method using the `GITHUB_TOKEN` loaded from a root level `.env` file.

```
# .env
GITHUB_TOKEN="<Your PAT>"
```

> This token should have read access to `repo` and `project` scopes. Get yours at https://github.com/settings/tokens.

### Tweak the request to your needs

The `add_issues.ts` file contains scripts to fetch all issues, in 100 count batches, based on the defined qraphql query. Issues already added to the given project are filtered out, (see https://github.com/nickofthyme/gh-project-v2-add-item/blob/main/add_issues.ts#L34-L37 and https://github.com/nickofthyme/gh-project-v2-add-item/blob/main/add_issues.ts#L105).

> It may help for testing to set the count param on the `getIssues` function to `1`, before opening up the flood gates :smile:

Then it loops through all issues as adds them to the defined project.

Finally it updates the newly added project item. You may want to change this update method to suit your needs, currently it just updates a hardcoded field to a defined set of options. You would need to find the `node_id` for these items manually using [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer).

## To run

Load dependencies

```
yarn
```

Run script

```
yarn run
```
