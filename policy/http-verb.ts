export interface HttpVerbPolicy {
  Post: boolean;
  Get: boolean;
  Put: boolean;
  Delete: boolean;
  Patch: boolean;
  Head: boolean;
  Options: boolean;
  All: boolean;
  Trace: boolean;
  Connect: boolean;
}

export const validateRequestMethodAgainstPolicy = (
  method: string,
  policy: HttpVerbPolicy
): boolean => {
  switch (method) {
    case "POST":
      return policy.Post;
    case "GET":
      return policy.Get;
    case "PUT":
      return policy.Put;
    case "DELETE":
      return policy.Delete;
    case "PATCH":
      return policy.Patch;
    case "HEAD":
      return policy.Head;
    case "OPTIONS":
      return policy.Options;
    case "ALL":
      return policy.All;
    case "TRACE":
      return policy.Trace;
    case "CONNECT":
      return policy.Connect;
    default:
      return false;
  }
};
