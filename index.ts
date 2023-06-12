import fs from "fs";
import path from "path";
import util from "util";
import express, { Request, Response, NextFunction } from "express";
import {
  HttpVerbPolicy,
  validateRequestMethodAgainstPolicy,
} from "./policy/http-verb";
import { CorsPolicy, buildCorsFromPolicy } from "./policy/cors";
import { HttpHeaderPolicy } from "./policy/http-header";
import {
  ContentSecurityPolicy,
  buildCSPPolicy,
} from "./policy/content-security-protection";
import { TracingPolicy } from "./policy/tracing";

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export class Interceptor {
  middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  build(app: express.Express): void {
    this.middleware.forEach((middleware) => app.use("/", middleware));
  }

  withTracing(policy: TracingPolicy): Interceptor {
    let logStream: fs.WriteStream | null = null;
    let logFile: string | null = null;
    const start = process.hrtime();

    if (policy.logLocation) {
      try {
        if (!fs.existsSync(policy.logLocation)) {
          fs.mkdirSync(policy.logLocation);
        }

        logFile = path.join(policy.logLocation, `${Date.now()}.log`);
        logStream = fs.createWriteStream(logFile, { flags: "a" });
      } catch (error) {
        policy.onError && policy.onError(error);
      }
    }

    const middleware: Middleware = (req, res, next) => {
      if (policy.logLocation && policy.maxSize && logStream && logFile) {
        try {
          const stats = fs.statSync(logFile);
          const fileSizeInMB = stats.size / (1024 * 1024);

          if (fileSizeInMB > policy.maxSize) {
            logStream.close();

            logFile = path.join(policy.logLocation, `${Date.now()}.log`);
            logStream = fs.createWriteStream(logFile, { flags: "a" });
          }
        } catch (error) {
          policy.onError && policy.onError(error);
        }
      }

      const logMessage =
        `HTTP ${req.method} ${req.url} \n` +
        `${
          policy.logHeaders ? "Headers:" + util.inspect(req.headers) + "\n" : ""
        }` +
        `${policy.logBody ? "Body:" + util.inspect(req.body) + "\n" : ""}`;

      if (logStream) {
        logStream.write(logMessage);
      } else {
        console.log(logMessage);
      }

      // proceed to next middleware
      next();
    };

    this.use(middleware);
    return this;
  }

  withLimitedHTTPVerbs(policy: HttpVerbPolicy): Interceptor {
    const middleware: Middleware = (req, res, next) => {
      if (validateRequestMethodAgainstPolicy(req.method, policy)) {
        next();
      } else {
        res.status(405).send();
      }
    };
    this.use(middleware);
    return this;
  }

  withMaxBodySize(maxBodySize: number): Interceptor {
    const limit = `${maxBodySize}mb`; // 'mb' is needed to indicate size in megabytes

    const jsonMiddleware: Middleware = express.json({ limit });
    this.use(jsonMiddleware);

    const urlencodedMiddleware: Middleware = express.urlencoded({
      limit,
      extended: true,
    });
    this.use(urlencodedMiddleware);

    return this;
  }

  withCors(policy: CorsPolicy): Interceptor {
    const middleware: Middleware = (req, res, next) => {
      buildCorsFromPolicy(policy, req, res);
      if (req.method === "OPTIONS") {
        return res.status(200).send(); // Send response and return without calling next()
      } else {
        next();
      }
    };
    this.use(middleware);
    return this;
  }

  withHeaderParser(policy: HttpHeaderPolicy): Interceptor {
    const middleware: Middleware = (req, res, next) => {
      if (req.headers[policy.header]) {
        req.headers[policy.header] = String(req.headers[policy.header]).trim();
      } else if (policy.errorOnMissing) {
        return res.status(400).send(`${policy.header} header is missing`);
      }
      next();
    };
    this.use(middleware);
    return this;
  }

  withContentSecurityPolicy(csp: ContentSecurityPolicy): Interceptor {
    const middleware: Middleware = (_, res, next) => {
      res.setHeader("Content-Security-Policy", buildCSPPolicy(csp));

      next();
    };

    this.use(middleware);
    return this;
  }
}
