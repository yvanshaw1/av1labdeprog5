export interface ServiceResponseDto {
  readonly id: string
  readonly name: string
  readonly description: string | null
  readonly price: number
  readonly durationInMinutes: number
  readonly createdAt: string
  readonly updatedAt: string
}
