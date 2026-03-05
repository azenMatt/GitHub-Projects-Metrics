export const PROJECT_QUERY_ORG = `
query($organization: String!, $number: Int!) {
  organization(login: $organization) {
    projectV2(number: $number) {
      id
      title
      fields(first: 50) {
        nodes {
          ... on ProjectV2SingleSelectField {
            name
            options { name }
          }
          ... on ProjectV2IterationField {
            name
            configuration {
              iterations { id title startDate duration }
              completedIterations { id title startDate duration }
            }
          }
        }
      }
    }
  }
}`;

export const PROJECT_QUERY_USER = `
query($login: String!, $number: Int!) {
  user(login: $login) {
    projectV2(number: $number) {
      id
      title
      fields(first: 50) {
        nodes {
          ... on ProjectV2SingleSelectField {
            name
            options { name }
          }
          ... on ProjectV2IterationField {
            name
            configuration {
              iterations { id title startDate duration }
              completedIterations { id title startDate duration }
            }
          }
        }
      }
    }
  }
}`;

export const ITEMS_QUERY = `
query($projectId: ID!, $cursor: String) {
  node(id: $projectId) {
    ... on ProjectV2 {
      items(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          createdAt
          updatedAt
          statusField: fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name }
          }
          iterationField: fieldValueByName(name: "Iteration") {
            ... on ProjectV2ItemFieldIterationValue {
              title
              startDate
              duration
            }
          }
          content {
            ... on Issue {
              __typename
              id
              number
              title
              url
              createdAt
              updatedAt
              closedAt
              issueType { name }
              labels(first: 20) { nodes { name } }
            }
            ... on PullRequest {
              __typename
              id
              number
              title
              url
              createdAt
              updatedAt
              closedAt
              labels(first: 20) { nodes { name } }
            }
            ... on DraftIssue {
              __typename
              id
              title
              createdAt
              updatedAt
            }
          }
        }
      }
    }
  }
}`;

export const SUB_ISSUES_QUERY = `
query($issueId: ID!, $cursor: String) {
  node(id: $issueId) {
    ... on Issue {
      subIssues(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          number
          title
          url
          closedAt
          stateReason
          issueType { name }
          subIssues(first: 0) { totalCount }
        }
      }
    }
  }
}`;
