import { Configuration } from "../configuration.js";
import { BaseAPI, pickFieldsFromArray } from "./base.js";

// --- Response Types ---

export interface EventFieldFilterOptions {
  name: string;
  type?: string[];
}

export interface EventFieldPivotOptions {
  name: string;
  summary?: boolean;
  values?: boolean;
  cardinality?: boolean;
  average?: boolean;
}

export interface EventField {
  custom: boolean;
  display_id: string;
  filter_options: EventFieldFilterOptions;
  pivot_options: EventFieldPivotOptions;
}

export type ListProjectEventFieldsResponse = EventField[];

export interface ListProjectEventFieldsOptions {
  [key: string]: any;
}

// --- API Class ---

export class ProjectAPI extends BaseAPI {
  static eventFieldFields: (keyof EventField)[] = [
    'custom',
    'display_id', 
    'filter_options',
    'pivot_options'
  ];

  constructor(configuration: Configuration) {
    super(configuration);
  }

  /**
   * List the Event Fields for a Project
   * GET /projects/{project_id}/event_fields
   * @param projectId The project ID
   * @returns A promise that resolves to the list of event fields
   */
  async listProjectEventFields(projectId: string): Promise<ListProjectEventFieldsResponse> {
    const url = `/projects/${projectId}/event_fields`;
    
    const data = await this.request<ListProjectEventFieldsResponse>({
      method: 'GET',
      url,
    });
    
    // Only return allowed fields
    return pickFieldsFromArray<EventField>(data as ListProjectEventFieldsResponse[], ProjectAPI.eventFieldFields);
  }
}
