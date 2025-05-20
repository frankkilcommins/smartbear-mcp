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
}