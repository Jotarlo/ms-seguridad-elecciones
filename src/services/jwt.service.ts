import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {Keys} from '../config/keys';
var jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService {
  constructor() { }

  /**
   * Se genera un token con la información en formato de JWT
   * @param info datos que quedarán en el token
   * @returns token firmado con la clave secreta
   */
  CrearToken(info: object): string {
    try {
      var token = jwt.sign(info, Keys.JwtSecretKey);
      return token;
    } catch (err) {
      throw err;
    }
  }

}
