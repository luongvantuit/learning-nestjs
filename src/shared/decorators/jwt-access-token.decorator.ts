import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAccessTokenPayload } from '../dto/payloads/jwt-access-token.payload';
import { TOKEN_ENUM } from '../enums/token.enum';
import { VARIABLE_ENVIRONMENT_ENUM } from '../enums/variable-environment.enum';

/**
 * Make param decorator get information of request in GraphQL
 * Use decorator requirement import JwtModule
 */
export const JwtAccessTokenDecorator = createParamDecorator(
  async <T extends Request = Request>(
    data: unknown,
    ctx: ExecutionContext,
  ): Promise<JwtAccessTokenPayload | null> => {
    const configService: ConfigService = new ConfigService();
    const jwtService: JwtService = new JwtService({});
    // Create context of GraphQL request
    const graphqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request: T = graphqlCtx.req as T;
    // Get access token if access token is null when return null value
    const accessToken: string | string[] =
      request.headers[TOKEN_ENUM.ACCESS_TOKEN];
    if (!accessToken || typeof accessToken !== 'string') {
      throw new UnauthorizedException('Access token is null!');
    }
    try {
      const jwtAccessToken: JwtAccessTokenPayload =
        await jwtService.verifyAsync<JwtAccessTokenPayload>(accessToken, {
          secret: configService.get<string>(
            VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_SECRET,
          ),
        });
      return jwtAccessToken;
    } catch (exception: any) {
      throw new UnauthorizedException('Access token is not valid!');
    }
  },
);
