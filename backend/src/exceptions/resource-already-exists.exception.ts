import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/** Violacao de unicidade: email de cliente, placa de veiculo, nome de servico. */
export class ResourceAlreadyExistsException extends ApplicationException {
  /**
   * @param message Sem argumento, descreve a colisao detectada pelo proprio
   *                banco, onde nao se sabe qual campo colidiu.
   */
  constructor(message = "A record with the same unique value already exists.") {
    super(problemTypes.resourceAlreadyExists, 409, message)
  }

  /** Colisao detectada pela regra de negocio, que sabe exatamente qual campo repetiu. */
  static forField(resourceName: string, fieldName: string, fieldValue: string): ResourceAlreadyExistsException {
    return new ResourceAlreadyExistsException(`${resourceName} already exists with ${fieldName} ${fieldValue}`)
  }
}
