export interface AppointmentItemResponseDto {
  readonly id: string
  readonly serviceId: string
  readonly bookedPrice: number
  readonly bookedDurationInMinutes: number
}

export interface AppointmentResponseDto {
  readonly id: string
  readonly clientId: string
  readonly vehicleId: string
  readonly scheduledFor: string
  readonly totalPrice: number
  readonly totalDurationInMinutes: number
  readonly items: readonly AppointmentItemResponseDto[]
  readonly createdAt: string
  readonly updatedAt: string
}
