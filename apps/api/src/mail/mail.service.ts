import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailOptions } from './mail.type';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string) {
    const mailOptions: EmailOptions = {
      to: email,
      subject: '[Locus] 회원가입 이메일 인증 번호',
      html: this.getEmailHTML(code),
    };
    await this.mailerService.sendMail(mailOptions);
  }

  private getEmailHTML(code: string) {
    return `
      <div style="font-family: 'Pretendard', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background-color: #f8f9fa; border-radius: 12px;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); text-align: center;">
          
          <div style="font-size: 24px; font-weight: 800; color: #3b82f6; margin-bottom: 24px; letter-spacing: -0.5px;">Locus</div>
          
          <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 8px;">이메일 인증을 완료해주세요</h2>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin-bottom: 32px;">
            회원가입을 진행해주셔서 감사합니다.<br/>
            아래의 6자리 인증 번호를 가입 화면에 입력해주세요.
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <span style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: 12px; margin-left: 12px;">${code}</span>
          </div>
          
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 24px;">
            인증 번호 유효 시간은 <strong style="color: #ef4444;">10분</strong>입니다.<br/>
            요청하신 적이 없다면 이 메일을 무시하셔도 됩니다.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
          
          <p style="font-size: 12px; color: #9ca3af;">
            본 메일은 발신 전용입니다. 문의 사항은 고객센터를 이용해주세요.<br/>
            © 2026 Locus Team. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}
