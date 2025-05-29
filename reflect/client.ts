import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Type definitions for tool arguments
export interface suiteArgs {
  suiteId: string;
}

export interface suiteExecutionArgs {
  suiteId: string;
  executionId: string;
}

export interface testArgs {
  testId: string;
}

export interface testExecutionArgs {
  testId: string;
  executionId: string;
}

// Tool definitions
export const listReflectSuitesTool: Tool = {
  name: "list_reflect_suites",
  description: "List all reflect suites",
  inputSchema: {
    type: "object",
    properties: {
    }
  }
};

export const listReflectSuiteExecutionsTool: Tool = {
  name: "list_reflect_suite_executions",
  description: "List all executions for a given reflect suite",
  inputSchema: {
    type: "object",
    properties: {
      suiteId: {
        type: "string",
        description: "ID of the reflect suite to list executions for",
      },
    },
    required: ["suiteId"]
  }
};

export const reflectSuiteExecutionStatusTool: Tool = {
  name: "reflect_suite_execution_status",
  description: "Get the status of a reflect suite execution",
  inputSchema: {
    type: "object",
    properties: {
      suiteId: {
        type: "string",
        description: "ID of the reflect suite to list executions for",
      },
      executionId: {
        type: "string",
        description: "ID of the reflect suite execution to get status for",
      },
    },
    required: ["suiteId", "executionId"]
  }
};


export const reflectSuiteExecutionTool: Tool = {
  name: "reflect_suite_execution",
  description: "Execute a reflect suite",
  inputSchema: {
    type: "object",
    properties: {
      suiteId: {
        type: "string",
        description: "ID of the reflect suite to list executions for",
      },
    },
    required: ["suiteId"]
  },
};

export const cancelReflectSuiteExecutionTool: Tool = {
  name: "cancel_reflect_suite_execution",
  description: "Cancel a reflect suite execution",
  inputSchema: {
    type: "object",
    properties: {
      suiteId: {
        type: "string",
        description: "ID of the reflect suite to cancel execution for",
      },
      executionId: {
        type: "string",
        description: "ID of the reflect suite execution to cancel",
      },
    },
    required: ["suiteId", "executionId"]
  },
};

export const listReflectTestsTool: Tool = {
  name: "list_reflect_tests",
  description: "List all reflect tests",
  inputSchema: {
    type: "object",
    properties: {
    },
  },
};

export const runReflectTestsTool: Tool = {
  name: "run_reflect_test",
  description: "Run a reflect test",
  inputSchema: {
    type: "object",
    properties: {
      testId: {
        type: "string",
        description: "ID of the reflect test to run",
      },
    },
    required: ["testId"]
  },
};

export const reflectTestStatusTool: Tool = {
  name: "reflect_test_status",
  description: "Get the status of a reflect test execution",
  inputSchema: {
    type: "object",
    properties: {
      testId: {
        type: "string",
        description: "ID of the reflect test to run",
      },
      executionId: {
        type: "string",
        description: "ID of the reflect test execution to get status for",
      },
    },
    required: ["testId", "executionId"]
  },
};

export class ReflectClient {
  private headers: { "X-API-KEY": string; "Content-Type": string };

  constructor(token: string) {
    this.headers = {
      "X-API-KEY": `${token}`,
      "Content-Type": "application/json",
    };
  }

  async listReflectSuits(): Promise<any> {
    const response = await fetch("https://api.reflect.run/v1/suites", {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async listSuiteExecutions(suiteId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async getSuiteExecutionStatus(suiteId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions/${executionId}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async executeSuite(suiteId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions`,
      {
        method: "POST",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async cancelSuiteExecution(suiteId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/suites/${suiteId}/executions/${executionId}/cancel`,
      {
        method: "PATCH",
        headers: this.headers,
      },
    );

    return response.json();
  }

  async listReflectTests(): Promise<any> {
    const response = await fetch("https://api.reflect.run/v1/tests", {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async runReflectTest(testId: string): Promise<any> {
    const response = await fetch(`https://api.reflect.run/v1/tests/${testId}/executions`, {
      method: "POST",
      headers: this.headers,
    });

    return response.json();
  }

  async getReflectTestStatus(testId: string, executionId: string): Promise<any> {
    const response = await fetch(
      `https://api.reflect.run/v1/executions/${executionId}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    return response.json();
  }
}