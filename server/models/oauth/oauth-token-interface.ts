import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'

import { UserModel } from '../user'

export type OAuthTokenInfo = {
  refreshToken: string
  refreshTokenExpiresAt: Date,
  client: {
    id: number
  },
  user: {
    id: number
  }
}

export namespace OAuthTokenMethods {
  export type GetByRefreshTokenAndPopulateClient = (refreshToken: string) => Promise<OAuthTokenInfo>
  export type GetByTokenAndPopulateUser = (bearerToken: string) => Promise<OAuthTokenInstance>
  export type GetByRefreshTokenAndPopulateUser = (refreshToken: string) => Promise<OAuthTokenInstance>

  export type RemoveByUserId = (userId) => Promise<number>
}

export interface OAuthTokenClass {
  getByRefreshTokenAndPopulateClient: OAuthTokenMethods.GetByRefreshTokenAndPopulateClient
  getByTokenAndPopulateUser: OAuthTokenMethods.GetByTokenAndPopulateUser
  getByRefreshTokenAndPopulateUser: OAuthTokenMethods.GetByRefreshTokenAndPopulateUser
  removeByUserId: OAuthTokenMethods.RemoveByUserId
}

export interface OAuthTokenAttributes {
  accessToken: string
  accessTokenExpiresAt: Date
  refreshToken: string
  refreshTokenExpiresAt: Date

  User?: UserModel
}

export interface OAuthTokenInstance extends OAuthTokenClass, OAuthTokenAttributes, Sequelize.Instance<OAuthTokenAttributes> {
  id: number
  createdAt: Date
  updatedAt: Date
}

export interface OAuthTokenModel extends OAuthTokenClass, Sequelize.Model<OAuthTokenInstance, OAuthTokenAttributes> {}
