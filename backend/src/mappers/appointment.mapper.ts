import type { CreateAppointmentRequestDto } from "../dtos/request/create-appointment.request.dto.js"
import type { UpdateAppointmentRequestDto } from "../dtos/request/update-appointment.request.dto.js"
import type {
  AppointmentItemResponseDto,
  AppointmentResponseDto,
} from "../dtos/response/appointment.response.dto.js"
import { Appointment } from "../models/appointment.entity.js"
import { AppointmentItem } from "../models/appointment-item.entity.js"
import type { Service } from "../models/service.entity.js"

function fromAppointmentItemToResponseDto(appointmentItem: AppointmentItem): AppointmentItemResponseDto {
  return {
    id: appointmentItem.id,
    serviceId: appointmentItem.serviceId,
    bookedPrice: appointmentItem.bookedPrice,
    bookedDurationInMinutes: appointmentItem.bookedDurationInMinutes,
  }
}

export const appointmentMapper = {
  // Totais e itens ficam de fora de proposito: dependem dos precos do catalogo
  // e sao montados pelo AppointmentService, nunca a partir do corpo da requisicao.
  fromCreateRequestDtoToEntity(requestDto: CreateAppointmentRequestDto): Appointment {
    const appointment = new Appointment()
    appointment.clientId = requestDto.clientId
    return appointmentMapper.applyUpdateRequestDtoToEntity(appointment, requestDto)
  },

  // O cliente nao entra aqui: `clientId` fica de fora do DTO de atualizacao.
  applyUpdateRequestDtoToEntity(appointment: Appointment, requestDto: UpdateAppointmentRequestDto): Appointment {
    appointment.vehicleId = requestDto.vehicleId
    appointment.scheduledFor = requestDto.scheduledFor
    return appointment
  },

  /** Retrata preco e duracao vigentes do servico no item do agendamento. */
  fromServiceToAppointmentItem(service: Service): AppointmentItem {
    const appointmentItem = new AppointmentItem()
    appointmentItem.serviceId = service.id
    appointmentItem.bookedPrice = service.price
    appointmentItem.bookedDurationInMinutes = service.durationInMinutes
    return appointmentItem
  },

  fromEntityToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      clientId: appointment.clientId,
      vehicleId: appointment.vehicleId,
      scheduledFor: appointment.scheduledFor.toISOString(),
      totalPrice: appointment.totalPrice,
      totalDurationInMinutes: appointment.totalDurationInMinutes,
      // A relacao pode nao ter sido carregada em consultas que dispensam os itens.
      items: (appointment.items ?? []).map(fromAppointmentItemToResponseDto),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }
  },
}
