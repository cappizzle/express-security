export enum LogLevel {
  INFO = "info",
  DEBUG = "debug",
  WARN = "warn",
  ERROR = "error",
}

/**
 * TracingPolicy interface. This interface is used to customize the behavior of the tracing middleware.
 */
export interface TracingPolicy {
  /**
   * logHeaders: Determines whether headers will be logged. Default is false.
   */
  logHeaders?: boolean;

  /**
   * logBody: Determines whether the request body will be logged. Default is false.
   */
  logBody?: boolean;

  /**
   * logLocation: The location where log files should be written. If not provided, logs will be written to the console.
   * Please ensure that the Node.js process has write access to this location.
   */
  logLocation?: string;

  /**
   * maxSize: Maximum size of a log file in MB. If a log file exceeds this size, a new file will be created.
   * Note: This option is applicable only if logLocation is provided.
   */
  maxSize?: number;

  /**
   * logLevel: The level of logs that should be written.
   * INFO: Log only request and response info, no headers or body.
   * DEBUG: Log all details including headers and body.
   * Default is INFO.
   */
  logLevel?: LogLevel;

  /**
   * logResponse: Determines whether the response details will be logged. Default is false.
   */
  logResponse?: boolean;

  /**
   * onError: This function will be called when an error occurs during the logging process, for example,
   * if writing to the logLocation fails. The provided function should accept an error object as its parameter.
   */
  onError?: (error: Error) => void;
}
