import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CartInterface } from '../order/dto/interfaces/cart.interface';
import { Order } from '../shared/schemas/order.schema';
import { JwtAccessTokenPayload } from 'src/shared/dto/payloads/jwt-access-token.payload';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async senderUserInvoice(
    user: JwtAccessTokenPayload,
    order: {
      carts: CartInterface[];
    } & Order,
  ) {
    const bodyMail = {
      subject: 'Invoice',
      template: 'templates/order',
      context: {
        user: user,
        order: order,
      },
    };
    try {
      if (user.email) {
        await this.mailerService.sendMail({
          to: user.email,
          ...bodyMail,
        });
      }
    } catch (e) {
      console.error(e);
    }
    try {
      if (order.carts[0].seller.email) {
        await this.mailerService.sendMail({
          to: order.carts[0].seller.email,
          ...bodyMail,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
