import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Make param decorator get information of request in GraphQL
 */
export const RequestGraphQLDecorator = createParamDecorator(
  <T extends Request = Request>(data: unknown, ctx: ExecutionContext): T => {
    // Create context of GraphQL request
    const graphqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request: T = graphqlCtx.req as T;
    return request;
  },
);
