import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {CredencialesLogin, CredencialesRecuperarClave, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {JwtService, SeguridadUsuarioService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @service(JwtService)
    private servicioJWT: JwtService
  ) { }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {

    let claveGenerada = this.servicioSeguridad.CrearClaveAleatoria();
    let claveCifrada = this.servicioSeguridad.CifrarCadena(claveGenerada);
    usuario.clave = claveCifrada;
    // notificar al usuario de que se ha creado en el sistema
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**
   * Bloque de Métodos personalizados para la seguridad del usuario
   */

  @post('/login')
  @response(200, {
    description: 'Identificación de Usuarios',
    content: {'application/json': {schema: getModelSchemaRef(CredencialesLogin)}},
  })
  async identificar(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredencialesLogin),
        },
      },
    })
    credenciales: CredencialesLogin,
  ): Promise<string> {
    try {
      return this.servicioSeguridad.IdentificarUsuario(credenciales);
    } catch (err) {
      throw new HttpErrors[400](`Se ha generado un error en la validación de las credenciales para el usuario ${credenciales.nombreUsuario}`);
    }
  }


  @post('/recuperar-clave')
  @response(200, {
    description: 'Identificación de Usuarios',
    content: {'application/json': {schema: getModelSchemaRef(CredencialesLogin)}},
  })
  async RecuperarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredencialesRecuperarClave),
        },
      },
    })
    credenciales: CredencialesRecuperarClave,
  ): Promise<boolean> {
    try {
      return this.servicioSeguridad.RecuperarClave(credenciales);
    } catch (err) {
      throw new HttpErrors[400](`Se ha generado un error en la recuperación de la clave para el correo ${credenciales.correo}`);
    }
  }

  @get('/validate-token/{jwt}')
  @response(200, {
    description: 'Validar un token JWT',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Object),
      },
    },
  })
  async validateJWT(
    @param.path.string('jwt') jwt: string
  ): Promise<string> {
    let valido = this.servicioJWT.ValidarToken(jwt);
    return valido;
  }

}
