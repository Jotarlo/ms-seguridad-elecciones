import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {AuditoriaLogin, AuditoriaLoginRelations, Usuario} from '../models';
import {UsuarioRepository} from './usuario.repository';

export class AuditoriaLoginRepository extends DefaultCrudRepository<
  AuditoriaLogin,
  typeof AuditoriaLogin.prototype._id,
  AuditoriaLoginRelations
> {

  public readonly usuario: BelongsToAccessor<Usuario, typeof AuditoriaLogin.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UsuarioRepository') protected usuarioRepositoryGetter: Getter<UsuarioRepository>,
  ) {
    super(AuditoriaLogin, dataSource);
    this.usuario = this.createBelongsToAccessorFor('usuario', usuarioRepositoryGetter,);
    this.registerInclusionResolver('usuario', this.usuario.inclusionResolver);
  }
}
