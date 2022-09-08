import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Usuario} from './usuario.model';

@model({settings: {strict: false}})
export class AuditoriaLogin extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'date',
    required: true,
  })
  fecha: string;

  @property({
    type: 'string',
  })
  ip?: string;

  @belongsTo(() => Usuario)
  usuarioId: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AuditoriaLogin>) {
    super(data);
  }
}

export interface AuditoriaLoginRelations {
  // describe navigational properties here
}

export type AuditoriaLoginWithRelations = AuditoriaLogin & AuditoriaLoginRelations;
