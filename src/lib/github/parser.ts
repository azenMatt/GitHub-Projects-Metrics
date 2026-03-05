export interface ProjectRef {
  owner: string;
  number: number;
  type: "organization" | "user";
}

/**
 * Parse a GitHub Projects V2 URL into its components.
 * Supports:
 *   https://github.com/orgs/{org}/projects/{number}
 *   https://github.com/users/{user}/projects/{number}
 */
export function parseProjectUrl(url: string): ProjectRef {
  const pattern =
    /github\.com\/(orgs|users)\/([^/]+)\/projects\/(\d+)/;
  const match = url.match(pattern);
  if (!match) {
    throw new Error(
      "Invalid GitHub Project URL. Expected format: https://github.com/orgs/{org}/projects/{number} or https://github.com/users/{user}/projects/{number}"
    );
  }
  return {
    type: match[1] === "orgs" ? "organization" : "user",
    owner: match[2],
    number: parseInt(match[3], 10),
  };
}
