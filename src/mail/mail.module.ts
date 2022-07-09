import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './mail.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        secure: false,
        host: 'smtp.gmail.com',
        auth: {
          user: 'tul739691@gmail.com',
          pass: 'LvTus@0906',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new EjsAdapter(),
        options: { strict: false },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
