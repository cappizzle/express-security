export interface ContentSecurityPolicy {
  defaultSrc?: string[];
  scriptSrc?: string[];
  objectSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  baseUri?: string[];
  childSrc?: string[];
  frameAncestors?: string[];
  formAction?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  navigateTo?: string[];
  reportUri?: string[];
  sandbox?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
}

const buildCSPDirective = (
  directive: string,
  sources: string[] | undefined
): string => {
  if (!sources) {
    return "";
  }

  return `${directive} ${sources.join(" ")};`;
};

export const buildCSPPolicy = (csp: ContentSecurityPolicy): string => {
  let response = "";

  // Set default-src policy if it exists or use a fallback
  response += buildCSPDirective("default-src", csp.defaultSrc || ["'self'"]);

  // Add other directives
  response += buildCSPDirective("script-src", csp.scriptSrc);
  response += buildCSPDirective("object-src", csp.objectSrc);
  response += buildCSPDirective("style-src", csp.styleSrc);
  response += buildCSPDirective("img-src", csp.imgSrc);
  response += buildCSPDirective("media-src", csp.mediaSrc);
  response += buildCSPDirective("frame-src", csp.frameSrc);
  response += buildCSPDirective("font-src", csp.fontSrc);
  response += buildCSPDirective("connect-src", csp.connectSrc);
  response += buildCSPDirective("base-uri", csp.baseUri);
  response += buildCSPDirective("child-src", csp.childSrc);
  response += buildCSPDirective("frame-ancestors", csp.frameAncestors);
  response += buildCSPDirective("form-action", csp.formAction);
  response += buildCSPDirective("worker-src", csp.workerSrc);
  response += buildCSPDirective("manifest-src", csp.manifestSrc);
  response += buildCSPDirective("navigate-to", csp.navigateTo);
  response += buildCSPDirective("report-uri", csp.reportUri);
  response += buildCSPDirective("sandbox", csp.sandbox);

  if (csp.upgradeInsecureRequests) {
    response += `upgrade-insecure-requests; `;
  }

  if (csp.blockAllMixedContent) {
    response += `block-all-mixed-content; `;
  }

  return response.trim();
};
