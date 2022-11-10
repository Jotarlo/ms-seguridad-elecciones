import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Keys} from '../config/keys';
import {CredencialesLogin, CredencialesRecuperarClave} from '../models';
import {UsuarioRepository} from '../repositories';
import {JwtService} from './jwt.service';
var generator = require('generate-password');
var MD5 = require("crypto-js/md5");
const fetch = require('node-fetch');

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
  async IdentificarUsuario(credenciales: CredencialesLogin): Promise<object> {
    let respuesta = {
      token: "",
      user: {
        name: "",
        email: "",
        role: "",
        id: ""
      }
    };
    console.log("Hola mundo " + credenciales.nombreUsuario + " - " + credenciales.clave)
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.nombreUsuario,
        clave: credenciales.clave
      }
    });
    console.log(usuario)

    if (usuario) {
      console.log(usuario)
      let datos = {
        name: `${usuario.nombres} ${usuario.apellidos}`,
        email: usuario.correo,
        role: usuario.rolId,
        id: usuario._id ? usuario._id : ""
      }
      try {
        let tk = this.servicioJwt.CrearToken(datos);
        respuesta.token = tk;
        respuesta.user = datos;
        console.log("respuesta: " + respuesta);
        console.log(respuesta);
      } catch (err) {
        throw err;
      }
    }
    console.log(respuesta)
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

  /**
   * Cifra una cadena de texto en MD5
   * @param cadena cadena a cifrar
   * @returns Cadena cifrada en MD5
   */
  CifrarCadena(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se recupera una clave generándola aleatoriamente y enviándola por correo
   * @param credenciales credenciales del usuario a recuperar la clave
   */
  async RecuperarClave(credenciales: CredencialesRecuperarClave): Promise<boolean> {

    const params = new URLSearchParams();
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo
      }
    });

    if (usuario) {
      let nuevaClave = this.CrearClaveAleatoria();
      let nuevaClaveCifrada = this.CifrarCadena(nuevaClave);
      usuario.clave = nuevaClaveCifrada;
      this.usuarioRepository.updateById(usuario._id, usuario);

      let mensaje = `Hola ${usuario.nombres} <br /> Su contraseña ha sido actualizada satisfactoriamente, y la nueva es ${nuevaClave} <br /><br /> Sí no ha sido usted quien cambio la contraseña por favor tome las medidas correspondientes y llame al *611. <br /><br /> Saludos, su amigo incondicional... equipo de soporte.`;
      console.log("Validator: " + process.env.HASH_VALIDATOR);

      params.append('hash_validator', 'Admin@notification.sender');
      params.append('destination', usuario.correo);
      params.append('subject', Keys.mensajeAsuntoRecuperarClave);
      params.append('message', mensaje);

      let r = '';

      await fetch(Keys.urlEnviarCorreo, {method: 'POST', body: params}).then(async (res: any) => {
        //console.log("2");
        r = await res.text();
        //console.log(r);
      });
      return r == "OK";
    } else {
      throw new HttpErrors[400]("El correo ingresado no está asociado a un usuario");
    }
  }

}
