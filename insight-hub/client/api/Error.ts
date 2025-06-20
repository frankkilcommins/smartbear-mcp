import { BaseAPI } from './base.js';
import { Configuration } from '../configuration.js';

// --- Response Types ---

export interface Error {
  id: string;
}

export interface Event {
  id: string;
}

export type ViewErrorOnProjectResponse = Error;
export type ViewLatestEventOnErrorResponse = Event;
export type ViewEventByIdResponse = Event;

export interface ViewErrorOnProjectOptions {
  [key: string]: any;
}

export interface ViewLatestEventOnErrorOptions {
  [key: string]: any;
}

export interface ViewEventByIdOptions {
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
}
