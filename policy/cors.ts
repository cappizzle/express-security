import express from "express";

export interface CorsPolicy {
  origin: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
  contentType?: string;
  maxAge?: number;
  exposeHeaders?: string[];
}

export const buildCorsFromPolicy = (
  policy: CorsPolicy,
  req: express.Request,
  res: express.Response<any, Record<string, any>>
) => {
  // Convert arrays to lower-case
  const allowedOrigins = Array.isArray(policy.origin)
    ? policy.origin.map((o) => o.toLowerCase())
    : [policy.origin.toLowerCase()];
  const allowedMethods = policy.methods?.map((m) => m.toLowerCase());
  const allowedHeaders = policy.allowedHeaders?.map((h) => h.toLowerCase());

  // Check the origin against the policy
  const requestOrigin = req.get("Origin")?.toLowerCase() || "null";
  const originAllowed =
    allowedOrigins.includes(requestOrigin) || allowedOrigins.includes("*");

  if (originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.status(403).send("CORS policy: origin not allowed");
    return;
  }

  if (policy.allowCredentials) {
    if (requestOrigin === "*" && policy.allowCredentials) {
      res
        .status(403)
        .send(
          "CORS policy: AllowCredentials cannot be used with wildcard origin"
        );
      return;
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (policy.exposeHeaders && Array.isArray(policy.exposeHeaders)) {
    res.setHeader(
      "Access-Control-Expose-Headers",
      policy.exposeHeaders.join(", ")
    );
  }

  if (req.method === "OPTIONS") {
    // Handle pre-flight request
    const requestMethod = req
      .get("Access-Control-Request-Method")
      ?.toLowerCase();
    if (!requestMethod) {
      return;
    }
    if (allowedMethods && allowedMethods.includes(requestMethod)) {
      res.setHeader(
        "Access-Control-Allow-Methods",
        requestMethod.toUpperCase()
      );
    } else {
      res.status(403).send("CORS policy: method not allowed in pre-flight");
      return;
    }

    const requestHeaders = req
      .get("Access-Control-Request-Headers")
      ?.split(",")
      .map((header) => header.trim().toLowerCase());
    if (
      allowedHeaders &&
      requestHeaders?.every((header) => allowedHeaders.includes(header))
    ) {
      res.setHeader("Access-Control-Allow-Headers", requestHeaders.join(", "));
      // Handle Content-Type
      const contentTypeIndex = requestHeaders.indexOf("content-type");
      if (contentTypeIndex > -1) {
        req.headers["content-type"] =
          req.headers["content-type"] ||
          policy.contentType ||
          "application/json";
      }
    } else {
      res.status(403).send("CORS policy: headers not allowed in pre-flight");
      return;
    }
  } else {
    // Regular request
    res.setHeader(
      "Access-Control-Allow-Methods",
      allowedMethods?.join(", ").toUpperCase() ?? "GET, POST, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      allowedHeaders?.join(", ") ?? "Content-Type, Authorization"
    );
    // Handle Content-Type for regular request
    if (allowedHeaders && allowedHeaders.includes("content-type")) {
      req.headers["content-type"] =
        req.headers["content-type"] || policy.contentType || "application/json";
    }
  }

  res.setHeader("Access-Control-Max-Age", String(policy.maxAge ?? 86400));
};
