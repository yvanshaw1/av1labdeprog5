import { createResourceApi } from "./resource-api.ts"

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  durationInMinutes: number
  createdAt: string
  updatedAt: string
}

export interface ServiceInput {
  name: string
  description: string | null
  price: number
  durationInMinutes: number
}

export const serviceApi = createResourceApi<Service, ServiceInput>("/api/services")
