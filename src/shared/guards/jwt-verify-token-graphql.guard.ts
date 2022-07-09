import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtAccessTokenPayload } from '../dto/payloads/jwt-access-token.payload';
import { VARIABLE_ENVIRONMENT_ENUM } from '../enums/variable-environment.enum';

/**
 * Verify access token in header when client request GraphQL
 */
@Injectable()
export class JwtVerifyTokenGraphQLGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const graphqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request: Request = graphqlCtx.req as Request;
    const accessToken = request.headers['access-token'];
    if (!accessToken || typeof accessToken !== 'string') {
      throw new UnauthorizedException(`Access token is null!`);
    }
    try {
      this.jwtService.verify<JwtAccessTokenPayload>(accessToken, {
        secret: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.JWT_ACCESS_TOKEN_SECRET,
        ),
      });
      return true;
    } catch (exception: any) {
      throw new UnauthorizedException(`Access token is not valid!`);
    }
  }
}
