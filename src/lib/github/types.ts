// GitHub Projects V2 API response types

export interface ProjectData {
  id: string;
  title: string;
  items: ProjectItem[];
  iterations: Iteration[];
  statusOptions: string[];
}

export interface ProjectItem {
  id: string;
  status: string | null;
  iteration: IterationValue | null;
  content: IssueContent | PullRequestContent | DraftContent | null;
}

export interface IterationValue {
  title: string;
  startDate: string;
  duration: number;
}

export interface Iteration {
  id: string;
  title: string;
  startDate: string;
  duration: number;
}

export interface IssueContent {
  __typename: "Issue";
  id: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  issueType: string | null;
  labels: string[];
}

export interface PullRequestContent {
  __typename: "PullRequest";
  id: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  labels: string[];
}

export interface DraftContent {
  __typename: "DraftIssue";
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemContent = IssueContent | PullRequestContent | DraftContent;

/** Maps issue node ID → status name → ISO timestamp of first entry into that status. */
export type StatusTransitionMap = Map<string, Map<string, string>>;

export interface HierarchyProgress {
  done: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface HierarchyNode {
  id: string;
  number: number;
  title: string;
  url: string;
  issueType: string | null;
  closedAt: string | null;
  status: string | null;
  children: HierarchyNode[];
  progress: HierarchyProgress;
  hasChildren: boolean;
}
