import axios, { Axios } from "axios";

interface AuthHeader {
  headers: { Authorization: string };
}

export abstract class BackendClient {
  private BACKEND_URL = process.env.BACKEND_URL;
  protected client: Axios;
  constructor() {
    this.client = axios.create({
      baseURL: this.BACKEND_URL,
    });
  }  
}
