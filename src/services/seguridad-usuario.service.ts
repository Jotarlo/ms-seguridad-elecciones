import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CredencialesLogin} from '../models';
import {UsuarioRepository} from '../repositories';
import {JwtService} from './jwt.service';
var generator = require('generate-password');
var MD5 = require("crypto-js/md5");

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    private usuarioRepository: UsuarioRepository,
    @service(JwtService)
    private servicioJwt: JwtService
  ) { }


  /**
   * Método para la autenticación de usuarios
   * @param credenciales credenciales de acceso
   * @returns una cadena con el token cuando todo está bien, o una cadena vacía cuando no coinciden las credenciales
   */
  async IdentificarUsuario(credenciales: CredencialesLogin): Promise<string> {
    let respuesta = "";

    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.nombreUsuario,
        clave: credenciales.clave
      }
    });

    if (usuario) {
      let datos = {
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        correo: usuario.correo,
        rol: usuario.rolId
      }
      try {
        respuesta = this.servicioJwt.CrearToken(datos);
        console.log(respuesta);
      } catch (err) {
        throw err;
      }
    }

    return respuesta;
  }


  /**
   * Genera una clave aleatoria
   * @returns clave generada
   */
  CrearClaveAleatoria(): string {
    let password = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true
    });
    console.log(password);
    return password;
  }

  CifrarCadena(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

}
