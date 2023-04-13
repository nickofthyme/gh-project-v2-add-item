import { graphql, print, wait } from './utils';

const total = 1000;
const delay = 100;

interface IssueRes {
  "pageInfo": {
    "endCursor": string;
  };
  "totalCount": number;
  nodes: Array<{
    "id": string,
    "title": string,
    "number": number,
    "projectV2": {
      "number": number
    } | null
  }>;
}

const fetchIssues = async (after?: string, count = 1) => {
  return graphql<IssueRes>(`query ($org: String!, $repo: String!, $projectNumber: Int!, $after: String, $count: Int) {
    repository(owner: $org, name: $repo) {
      issues(first: $count, orderBy: { field: CREATED_AT, direction: ASC }, after: $after) {
        pageInfo {
          endCursor
        }
        totalCount
        nodes {
          id
          title
          number
          closed
          projectV2(number: $projectNumber) {
            number
          }
        }
      }
    }
  }`, {
    after,
    count,
  }, 'data.repository.issues');
}

const getIssues = async (count = 1) => {
  if (count <= 100) {
    return (await fetchIssues(undefined, count)).nodes;
  }

  const issues = [];
  let after;
  for (let i = 0; i < Math.ceil(count / 100); i++) {
    const response = await fetchIssues(after, 100);
    after = response.pageInfo.endCursor;
    issues.push(...response.nodes);
  }

  return issues.slice(0, count);
}

const addProjectItem = ({ id, title, number }) => {
  console.log(`Adding [#${number}] - ${title}`)

  return graphql(`mutation addProjectItem($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId }) {
      item {
        id
      }
    }
  }`, {
    contentId: id,
  }, 'data.addProjectV2ItemById.item');
}

// Options for status of https://github.com/orgs/elastic/projects/1141
enum StatusFieldOptions {
  New = "2eecdd2f",
  Backlog = "6763e6a6",
  NextUp = "f75ad846",
  InProgress = "47fc9ee4",
  InReview = "98236657",
  Done = "fee7b895",
  Blocked = "ef41ddf3",
  Canceled = "f35ea05d",
}

const updateProjectItem = (id, optionId = StatusFieldOptions.New) => {
  console.log(`Updating project item ${id} -- status -> ${optionId}`)

  return graphql(`mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(
      input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { singleSelectOptionId: $optionId } }
    ) {
      clientMutationId
    }
  }`, {
    itemId: id,
    fieldId: "PVTSSF_lADOAGc3Zs4AK0A8zgGxaMI", // Status project field
    optionId,
  });
}

async function chainPromises(rawIssues = []) {
  const issues = rawIssues.filter(({ projectV2 }) => !projectV2);

  console.log(`Adding ${issues.length} issues to the project`);

  let count = 0;
  for (const issue of issues) {
    try {
      await wait(delay)
      const { id } = await addProjectItem(issue)
      await updateProjectItem(id, issue.closed ? StatusFieldOptions.Done : StatusFieldOptions.New)
      count++;
    } catch (e) {
      console.error(e);
      return count
    }
  }

  return count;
}

async function main() {
  try {
    var issues = await getIssues(total);
    print(issues)

    const addedCount = await chainPromises(issues);
    console.log(`Added ${addedCount} issues to the project`);
  } catch (e) {
    console.error(e);
  }
};

main()
