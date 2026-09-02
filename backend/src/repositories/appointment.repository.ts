import type { Appointment } from "../models/appointment.entity.js"
import type { CrudRepository } from "./crud.repository.js"

export type AppointmentRepository = CrudRepository<Appointment>
