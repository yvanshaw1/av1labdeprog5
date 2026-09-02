import { createResourceApi } from "./resource-api.ts"

export interface Client {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  createdAt: string
  updatedAt: string
}

export interface ClientInput {
  fullName: string
  email: string
  phoneNumber: string
}

export const clientApi = createResourceApi<Client, ClientInput>("/api/clients")
