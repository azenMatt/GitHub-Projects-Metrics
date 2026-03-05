import { ProjectRef } from "./parser";
import {
  PROJECT_QUERY_ORG,
  PROJECT_QUERY_USER,
  ITEMS_QUERY,
  SUB_ISSUES_QUERY,
  STATUS_TIMELINE_QUERY,
} from "./queries";
import {
  ProjectData,
  ProjectItem,
  Iteration,
  IssueContent,
  PullRequestContent,
  DraftContent,
  HierarchyNode,
  HierarchyProgress,
  StatusTransitionMap,
} from "./types";

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

interface GraphQLResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any[];
}

async function graphql(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<GraphQLResponse> {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    const messages = json.errors.map((e: { message: string }) => e.message);
    const combined = messages.join("; ");
    if (combined.toLowerCase().includes("resource not accessible")) {
      throw new Error(
        `${combined}\n\nYour token lacks permission to access this project. ` +
        `If using a fine-grained PAT, go to Settings → Developer settings → Fine-grained tokens → edit your token and ensure:\n` +
        `  • "Organization projects" is set to "Read" (for org projects)\n` +
        `  • "Projects" (under Repository permissions) is set to "Read"\n` +
        `  • The token has access to the correct organization\n\n` +
        `Alternatively, use a classic PAT with the "project" and "repo" scopes.`
      );
    }
    throw new Error(combined);
  }
  return json;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseItemNode(node: any): ProjectItem {
  const content = node.content;
  let parsedContent: IssueContent | PullRequestContent | DraftContent | null = null;

  if (content?.__typename === "Issue" || content?.__typename === "PullRequest") {
    parsedContent = {
      __typename: content.__typename,
      id: content.id,
      number: content.number,
      title: content.title,
      url: content.url,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      closedAt: content.closedAt,
      ...(content.__typename === "Issue"
        ? { issueType: content.issueType?.name ?? null }
        : {}),
      labels: content.labels?.nodes?.map((l: { name: string }) => l.name) ?? [],
    } as IssueContent | PullRequestContent;
  } else if (content?.__typename === "DraftIssue") {
    parsedContent = {
      __typename: "DraftIssue",
      id: content.id,
      title: content.title,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    };
  }

  const iterField = node.iterationField;
  return {
    id: node.id,
    status: node.statusField?.name ?? null,
    iteration: iterField?.title
      ? {
          title: iterField.title,
          startDate: iterField.startDate,
          duration: iterField.duration,
        }
      : null,
    content: parsedContent,
  };
}

export async function fetchProject(
  token: string,
  ref: ProjectRef
): Promise<ProjectData> {
  // 1. Fetch project metadata (id, title, fields)
  const query =
    ref.type === "organization" ? PROJECT_QUERY_ORG : PROJECT_QUERY_USER;
  const variables =
    ref.type === "organization"
      ? { organization: ref.owner, number: ref.number }
      : { login: ref.owner, number: ref.number };

  const metaRes = await graphql(token, query, variables);
  const projectNode =
    ref.type === "organization"
      ? metaRes.data.organization.projectV2
      : metaRes.data.user.projectV2;

  if (!projectNode) {
    throw new Error(
      `Project #${ref.number} not found for ${ref.type} "${ref.owner}". Check the URL and PAT permissions.`
    );
  }

  // Extract iterations and status options from field definitions
  const iterations: Iteration[] = [];
  let statusOptions: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const field of projectNode.fields.nodes) {
    if (field.name === "Status" && field.options) {
      statusOptions = field.options.map((o: { name: string }) => o.name);
    }
    if (field.name === "Iteration" && field.configuration) {
      const allIters = [
        ...(field.configuration.iterations ?? []),
        ...(field.configuration.completedIterations ?? []),
      ];
      for (const it of allIters) {
        iterations.push({
          id: it.id,
          title: it.title,
          startDate: it.startDate,
          duration: it.duration,
        });
      }
    }
  }

  // Sort iterations by start date
  iterations.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // 2. Fetch all items with pagination
  const items: ProjectItem[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const itemsRes = await graphql(token, ITEMS_QUERY, {
      projectId: projectNode.id,
      cursor,
    });

    const itemsData = itemsRes.data.node.items;
    for (const node of itemsData.nodes) {
      items.push(parseItemNode(node));
    }

    hasNextPage = itemsData.pageInfo.hasNextPage;
    cursor = itemsData.pageInfo.endCursor;
  }

  return {
    id: projectNode.id,
    title: projectNode.title,
    items,
    iterations,
    statusOptions,
  };
}

function computeProgress(children: HierarchyNode[]): HierarchyProgress {
  if (children.length === 0) return { done: 0, inProgress: 0, notStarted: 0, total: 0 };

  let done = 0, inProgress = 0, notStarted = 0;
  for (const child of children) {
    if (child.closedAt) {
      done++;
    } else if (child.status) {
      // Has a project status but not closed → in progress
      inProgress++;
    } else {
      notStarted++;
    }
  }
  return { done, inProgress, notStarted, total: children.length };
}

async function fetchSubIssues(
  token: string,
  issueId: string,
  projectItemMap: Map<string, ProjectItem>,
  depth: number = 0,
  maxDepth: number = 3
): Promise<HierarchyNode[]> {
  if (depth >= maxDepth) return [];

  const nodes: HierarchyNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await graphql(token, SUB_ISSUES_QUERY, { issueId, cursor });
    const subIssues = res.data?.node?.subIssues;
    if (!subIssues) break;

    for (const node of subIssues.nodes) {
      const projectItem = projectItemMap.get(node.id);
      const hasChildren = (node.subIssues?.totalCount ?? 0) > 0;

      const children = hasChildren
        ? await fetchSubIssues(token, node.id, projectItemMap, depth + 1, maxDepth)
        : [];

      const hierarchyNode: HierarchyNode = {
        id: node.id,
        number: node.number,
        title: node.title,
        url: node.url,
        issueType: node.issueType?.name ?? null,
        closedAt: node.closedAt ?? null,
        status: projectItem?.status ?? (node.closedAt ? "Done" : null),
        children,
        progress: computeProgress(children),
        hasChildren,
      };
      nodes.push(hierarchyNode);
    }

    hasNextPage = subIssues.pageInfo.hasNextPage;
    cursor = subIssues.pageInfo.endCursor;
  }

  return nodes;
}

export async function fetchInitiativeHierarchy(
  token: string,
  projectData: ProjectData
): Promise<HierarchyNode[]> {
  // Build map of issue content ID → project item for status lookup
  const projectItemMap = new Map<string, ProjectItem>();
  for (const item of projectData.items) {
    if (item.content && "id" in item.content) {
      projectItemMap.set(item.content.id, item);
    }
  }

  // Find top-level items: initiatives and epics
  const topItems = projectData.items.filter(
    (item) =>
      item.content?.__typename === "Issue" &&
      ["initiative", "epic"].includes(
        (item.content as IssueContent).issueType?.toLowerCase() ?? ""
      )
  );

  const roots: HierarchyNode[] = [];
  for (const item of topItems) {
    const content = item.content as IssueContent;
    const children = await fetchSubIssues(token, content.id, projectItemMap);

    roots.push({
      id: content.id,
      number: content.number,
      title: content.title,
      url: content.url,
      issueType: content.issueType,
      closedAt: content.closedAt,
      status: item.status,
      children,
      progress: computeProgress(children),
      hasChildren: children.length > 0,
    });
  }

  return roots;
}

/**
 * Fetch status transition timestamps for closed issues in a project.
 * Returns a map: issueNodeId → statusName → first ISO timestamp the item entered that status.
 */
export async function fetchStatusTransitions(
  token: string,
  projectData: ProjectData
): Promise<StatusTransitionMap> {
  const transitionMap: StatusTransitionMap = new Map();
  const projectId = projectData.id;

  // Collect closed issue IDs
  const issueIds: string[] = [];
  for (const item of projectData.items) {
    if (
      item.content &&
      item.content.__typename === "Issue" &&
      item.content.closedAt
    ) {
      issueIds.push(item.content.id);
    }
  }

  // Fetch timeline events for each issue
  for (const issueId of issueIds) {
    let cursor: string | null = null;
    let hasNextPage = true;
    const statusTimestamps = new Map<string, string>();

    while (hasNextPage) {
      const res = await graphql(token, STATUS_TIMELINE_QUERY, {
        issueId,
        projectId,
        cursor,
      });

      const timeline = res.data?.node?.timelineItems;
      if (!timeline) break;

      for (const event of timeline.nodes) {
        if (!event || !event.status) continue;
        // Only include events from this project
        if (event.project?.id !== projectId) continue;
        const status = event.status as string;
        // Keep the earliest timestamp for each status
        if (!statusTimestamps.has(status)) {
          statusTimestamps.set(status, event.createdAt);
        }
      }

      hasNextPage = timeline.pageInfo.hasNextPage;
      cursor = timeline.pageInfo.endCursor;
    }

    if (statusTimestamps.size > 0) {
      transitionMap.set(issueId, statusTimestamps);
    }
  }

  return transitionMap;
}
