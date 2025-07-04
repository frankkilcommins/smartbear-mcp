import { BaseAPI } from './base.js';
import { Configuration } from '../configuration.js';

// --- Response Types ---

export interface Error {
  id: string;
}

export interface Event {
  id: string;
}

export interface ErrorApiView {
  id: string;
  project_id: string;
  error_class: string;
  message: string;
  context: string;
  events: number;
  users: number;
  first_seen: string;
  last_seen: string;
  status: string;
  // Add other properties as needed based on the API spec
}

export type ViewErrorOnProjectResponse = Error;
export type ViewLatestEventOnErrorResponse = Event;
export type ViewEventByIdResponse = Event;
export type ListProjectErrorsResponse = ErrorApiView[];

export interface ViewErrorOnProjectOptions {
  [key: string]: any;
}

export interface ViewLatestEventOnErrorOptions {
  [key: string]: any;
}

export interface ViewEventByIdOptions {
  [key: string]: any;
}

export interface ListProjectErrorsOptions {
  base?: string; // date-time format
  sort?: 'last_seen' | 'first_seen' | 'users' | 'events' | 'unsorted';
  direction?: 'asc' | 'desc';
  per_page?: number;
  filters?: any; // Filters object as defined in the API spec
  [key: string]: any;
}

// --- API Class ---

export class ErrorAPI extends BaseAPI {
  constructor(configuration: Configuration) {
    super(configuration);
  }

  /**
   * View an Error on a Project
   * GET /projects/{project_id}/errors/{error_id}
   */
  async viewErrorOnProject(projectId: string, errorId: string, options: ViewErrorOnProjectOptions = {}): Promise<ViewErrorOnProjectResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const url = params.toString()
      ? `/projects/${projectId}/errors/${errorId}?${params}`
      : `/projects/${projectId}/errors/${errorId}`;
    return (await this.request<ViewErrorOnProjectResponse>({
      method: 'GET',
      url,
    })) as ViewErrorOnProjectResponse;
  }

  /**
   * View the latest Event on an Error
   * GET /errors/{error_id}/latest_event
   */
  async viewLatestEventOnError(errorId: string, options: ViewLatestEventOnErrorOptions = {}): Promise<ViewLatestEventOnErrorResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const url = params.toString()
      ? `/errors/${errorId}/latest_event?${params}`
      : `/errors/${errorId}/latest_event`;
    return (await this.request<ViewLatestEventOnErrorResponse>({
      method: 'GET',
      url,
    })) as ViewLatestEventOnErrorResponse;
  }

  /**
   * View an Event by ID
   * GET /projects/{project_id}/events/{event_id}
   */
  async viewEventById(projectId: string, eventId: string, options: ViewEventByIdOptions = {}): Promise<ViewEventByIdResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const url = params.toString()
      ? `/projects/${projectId}/events/${eventId}?${params}`
      : `/projects/${projectId}/events/${eventId}`;
    return (await this.request<ViewEventByIdResponse>({
      method: 'GET',
      url,
    })) as ViewEventByIdResponse;
  }

  /**
   * List the Errors on a Project
   * GET /projects/{project_id}/errors
   */
  async listProjectErrors(projectId: string, options: ListProjectErrorsOptions = {}): Promise<ListProjectErrorsResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        if (key === 'filters' && typeof value === 'object') {
          // Handle filters as JSON string if it's an object
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    }
    const url = params.toString()
      ? `/projects/${projectId}/errors?${params}`
      : `/projects/${projectId}/errors`;
    return (await this.request<ListProjectErrorsResponse>({
      method: 'GET',
      url,
    })) as ListProjectErrorsResponse;
  }
}
