using HospitalManagement.Config;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace HospitalManagement.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfig _emailConfig;

        public EmailService(IOptions<EmailConfig> emailConfig)
        {
            _emailConfig = emailConfig.Value;
        }

        public async Task SendAppointmentCreatedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, string portalLink)
        {
            var subject = "Randevunuz Yaradıldı";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">📅 Randevunuz Yaradıldı</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {patientName},</h2>
                <p style="color: #64748b;">Randevunuz uğurla yaradıldı.</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Həkim</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">Dr. {doctorName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Tarix</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">{appointmentDate:dd.MM.yyyy HH:mm}</td>
                        </tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{portalLink}" style="background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        💳 Ödəniş et və Randevuma bax
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu link 30 gün ərzində etibarlıdır.</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 Hospital Management</p>
            </div>
        </div>
        """;
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAppointmentConfirmedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate)
        {
            var subject = "Randevunuz Təsdiqləndi";
            var body = $"""
                <h2>Hörmətli {patientName},</h2>
                <p>Randevunuz təsdiqləndi.</p>
                <p><strong>Həkim:</strong> Dr. {doctorName}</p>
                <p><strong>Tarix:</strong> {appointmentDate:dd.MM.yyyy HH:mm}</p>
                <p>Sizi gözləyirik!</p>
                <br/>
                <p>Hörmətlə,</p>
                <p><strong>Hospital Management</strong></p>
                """;

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAppointmentCancelledAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate)
        {
            var subject = "Randevunuz Ləğv Edildi";
            var body = $"""
                <h2>Hörmətli {patientName},</h2>
                <p>Randevunuz ləğv edildi.</p>
                <p><strong>Həkim:</strong> Dr. {doctorName}</p>
                <p><strong>Tarix:</strong> {appointmentDate:dd.MM.yyyy HH:mm}</p>
                <p>Yeni randevu üçün bizimlə əlaqə saxlayın.</p>
                <br/>
                <p>Hörmətlə,</p>
                <p><strong>Hospital Management</strong></p>
                """;

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAppointmentCompletedAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate)
        {
            var subject = "Randevunuz Tamamlandı";
            var body = $"""
                <h2>Hörmətli {patientName},</h2>
                <p>Randevunuz uğurla tamamlandı.</p>
                <p><strong>Həkim:</strong> Dr. {doctorName}</p>
                <p><strong>Tarix:</strong> {appointmentDate:dd.MM.yyyy HH:mm}</p>
                <p>Sağlıqlı günlər diləyirik!</p>
                <br/>
                <p>Hörmətlə,</p>
                <p><strong>Hospital Management</strong></p>
                """;

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailConfig.SenderName, _emailConfig.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(_emailConfig.Host, _emailConfig.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_emailConfig.SenderEmail, _emailConfig.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendWelcomeDoctorAsync(string toEmail, string doctorName, string temporaryPassword)
        {
            var subject = "Xoş Gəlmisiniz - Hospital Management";
            var body = $"""
                <h2>Hörmətli Dr. {doctorName},</h2>
                <p>Sistemə xoş gəlmisiniz!</p><p><strong>Email:</strong> {toEmail}</p>
                <p><strong>Şifrə:</strong> {temporaryPassword}</p>
                <p>Zəhmət olmasa ilk girişdən sonra şifrənizi dəyişin.</p>
                <br/>
                <p>Hörmətlə,</p>
                <p><strong>Hospital Management</strong></p>
                """;
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPaymentReceiptAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, decimal amount, string transactionId, string cardLast4, byte[] receiptPdf)
        {
            var subject = "Ödəniş Qəbzi - Hospital Management";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">✓ Ödəniş Uğurlu</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Qəbziniz bu emailə əlavə edilib</p>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {patientName},</h2>
                <p style="color: #64748b;">Ödənişiniz uğurla qəbul edildi. Qəbziniz bu emailə PDF formatında əlavə edilib.</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Həkim</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">Dr. {doctorName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Randevu tarixi</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">{appointmentDate:dd.MM.yyyy HH:mm}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Kart</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">•••• •••• •••• {cardLast4}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Tranzaksiya ID</td>
                            <td style="padding: 12px 0; color: #10b981; font-weight: bold; text-align: right; font-size: 12px;">{transactionId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 0 0; color: #1e293b; font-size: 16px; font-weight: bold;">Ödənilən məbləğ</td>
                            <td style="padding: 16px 0 0; color: #10b981; font-size: 24px; font-weight: 900; text-align: right;">{amount} ₼</td>
                        </tr>
                    </table>
                </div>
                <p style="color: #64748b; font-size: 14px;">📎 Ətraflı qəbz bu emailə attach edilib.</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 Hospital Management</p>
            </div>
        </div>
        """;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailConfig.SenderName, _emailConfig.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = body;

            builder.Attachments.Add(
                $"qebz-{transactionId}.pdf",
                receiptPdf,
                new ContentType("application", "pdf")
            );

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_emailConfig.Host, _emailConfig.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_emailConfig.SenderEmail, _emailConfig.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendPaymentReminderAsync(string toEmail, string patientName, string doctorName, DateTimeOffset appointmentDate, decimal amount, string portalLink)
        {
            var subject = "⚠️ Ödənilməmiş Borc - Hospital Management";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Ödəniş Xatırlatması</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {patientName},</h2>
                <p style="color: #64748b;">Aşağıdakı randevunuz üçün ödənilməmiş borcunuz vardır.</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #fbbf24;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Həkim</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">Dr. {doctorName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Randevu tarixi</td>
                            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; text-align: right;">{appointmentDate:dd.MM.yyyy HH:mm}</td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 0 0; color: #1e293b; font-size: 16px; font-weight: bold;">Borc məbləği</td>
                            <td style="padding: 16px 0 0; color: #ef4444; font-size: 24px; font-weight: 900; text-align: right;">{amount} ₼</td>
                        </tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{portalLink}" style="background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        💳 İndi Ödə
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu link 30 gün ərzində etibarlıdır.</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 Hospital Management</p>
            </div>
        </div>
        """;
            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendPasswordResetAsync(string toEmail, string fullName, string token)
        {
            var resetLink = $"http://localhost:5173/reset-password?token={token}";
            var subject = "Şifrə Sıfırlama - Hospital Management";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🔐 Şifrə Sıfırlama</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {fullName},</h2>
                <p style="color: #64748b;">Şifrə sıfırlama tələbi aldıq. Aşağıdakı düyməyə basın:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{resetLink}" 
                       style="background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Şifrəni Sıfırla
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 13px;">Bu link 1 saat ərzində etibarlıdır.</p>
                <p style="color: #94a3b8; font-size: 13px;">Əgər siz tələb etməmisinizsə bu emaili nəzərə almayın.</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 Hospital Management</p>
            </div>
        </div>
        """;
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPaymentConfirmedAsync(string toEmail, string patientName, decimal amount, Guid appointmentId)
        {
            var subject = "✅ Ödəniş Təsdiqləndi - Hospital Management";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">✅ Ödəniş Təsdiqləndi</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {patientName},</h2>
                <p style="color: #64748b;">Ödənişiniz uğurla qəbul edildi.</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #10b981;">
                    <p style="color: #1e293b; font-size: 16px; font-weight: bold;">Məbləğ: {amount} ₼</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Randevunuzu gözləyirik!</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 Hospital Management</p>
            </div>
        </div>
        """;
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendTwoFactorCodeAsync(string toEmail, string fullName, string code)
        {
            var subject = "🔐 Giriş Təsdiq Kodu - MedCare";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Təsdiq Kodu</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {fullName},</h2>
                <p style="color: #64748b;">MedCare sisteminə giriş üçün aşağıdakı kodu istifadə edin:</p>
                <div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 2px solid #10b981;">
                    <p style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #10b981; margin: 0;">{code}</p>
                </div>
                <p style="color: #94a3b8; font-size: 13px; text-align: center;">Bu kod <strong>5 dəqiqə</strong> ərzində etibarlıdır.</p>
                <p style="color: #94a3b8; font-size: 13px; text-align: center;">Əgər siz giriş etməmisinizsə, bu emaili nəzərə almayın.</p>
            </div>
            <div style="background: #1e293b; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">© 2025 MedCare Hospital Management</p>
            </div>
        </div>
        """;
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPrescriptionAsync(string toEmail, string patientName, string doctorName, string diagnosis, byte[] pdfAttachment)
        {
            var subject = "💊 E-Reseptiniz - MedCare Hospital";
            var body = $"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">💊 E-Reseptiniz Hazırdır</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">Hörmətli {patientName},</h2>
                <p style="color: #64748b;">Dr. {doctorName} tərəfindən reseptiniz hazırlanıb.</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px;"><strong>Diaqnoz:</strong> {diagnosis}</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">📎 Reseptiniz bu emailə PDF formatında əlavə edilib.</p>
                <p style="color: #94a3b8; font-size: 12px;">Aptekdə resepti göstərmək üçün PDF-i çap edin və ya QR kodu skan etdirin.</p>
            </div>
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">© 2025 MedCare Hospital Management</p>
            </div>
        </div>
        """;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailConfig.SenderName, _emailConfig.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = body;
            builder.Attachments.Add("e-resept.pdf", pdfAttachment, new ContentType("application", "pdf"));
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_emailConfig.Host, _emailConfig.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_emailConfig.SenderEmail, _emailConfig.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
