import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { DecodeAccessTokenModel } from '../../auth/models/decode-access-token.model';
import { AusVieRequest } from '../dto/interfaces/aus-vie-request.interface';
import { JwtAccessTokenPayload } from '../dto/payloads/jwt-access-token.payload';
import { VARIABLE_ENVIRONMENT_ENUM } from '../enums/variable-environment.enum';

/**
 * Request of GraphQl required verify access token & decode
 */
export const AusVieRequestGraphQLDecorator = createParamDecorator(
  async <T extends AusVieRequest = AusVieRequest>(
    data: unknown,
    ctx: ExecutionContext,
  ): Promise<T> => {
    // Initial ConfigService & JwtService
    const configService: ConfigService = new ConfigService();
    const jwtService: JwtService = new JwtService({});
    // Gql context get request
    const graphqlCtx = await GqlExecutionContext.create(ctx).getContext();
    const request: T = graphqlCtx.req as T;
    // Get access token from header
    const accessToken: string | string[] = request.headers['access-token'];
    if (!accessToken && typeof accessToken !== 'string') {
      throw new BadRequestException('Access token is null!');
    }
    // Verify access token
    try {
      const jwtAccessToken: JwtAccessTokenPayload =
        await jwtService.verifyAsync<JwtAccessTokenPayload>(
          accessToken as string,
          {
            secret: configService.get<string>(
              VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_SECRET,
            ),
          },
        );
      request.user = {
        accessToken: accessToken as string,
        ...(jwtAccessToken as DecodeAccessTokenModel),
      };
    } catch (exception: any) {
      throw new UnauthorizedException('Access token is not valid!');
    }
    return request;
  },
);
