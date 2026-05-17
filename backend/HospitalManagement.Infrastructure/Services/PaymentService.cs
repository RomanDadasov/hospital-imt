using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using HospitalManagement.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HospitalManagement.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PaymentService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<PaymentResponseDto> ProcessAsync(CreatePaymentDto dto)
        {
            await Task.Delay(1000);
            var cardNumber = dto.CardNumber.Replace(" ", "");
            var last4 = cardNumber[^4..];
            var status = PaymentStatus.Paid;
            string? failureReason = null;

            if (cardNumber == "4000000000000002") { status = PaymentStatus.Failed; failureReason = "Kart rədd edildi"; }
            else if (cardNumber == "4000000000000069") { status = PaymentStatus.Failed; failureReason = "Kartın müddəti bitib"; }
            else if (cardNumber == "4000000000000127") { status = PaymentStatus.Failed; failureReason = "Yanlış CVV"; }
            else if (cardNumber != "4242424242424242")
            {
                var random = new Random();
                if (random.Next(100) >= 80) { status = PaymentStatus.Failed; failureReason = "Bank tərəfindən rədd edildi"; }
            }

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                AppointmentId = dto.AppointmentId,
                Amount = dto.Amount,
                CardLast4 = last4,
                CardHolderName = dto.CardHolderName,
                TransactionId = $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{Guid.NewGuid().ToString()[..4].ToUpper()}",
                Status = status,
                FailureReason = failureReason,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if (status == PaymentStatus.Paid)
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor).ThenInclude(d => d.User)
                    .Include(a => a.Doctor).ThenInclude(d => d.Department)
                    .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);

                if (appointment != null)
                {
                    appointment.Status = AppointmentStatus.Confirmed;
                    await _context.SaveChangesAsync();

                    byte[]? receiptPdf = null;
                    try { receiptPdf = await GenerateReceiptPdfAsync(dto.AppointmentId); } catch { }

                    var appointmentSnapshot = appointment;
                    var paymentSnapshot = payment;

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _emailService.SendPaymentReceiptAsync(
                                appointmentSnapshot.Patient.Email,
                                appointmentSnapshot.Patient.FullName,
                                appointmentSnapshot.Doctor.User.FullName,
                                appointmentSnapshot.AppointmentDate,
                                dto.Amount,
                                paymentSnapshot.TransactionId,
                                paymentSnapshot.CardLast4,
                                receiptPdf ?? Array.Empty<byte>()
                            );
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"EMAIL XETA: {ex.Message}");
                        }
                    });
                }
            }

            return MapToDto(payment);
        }

        public async Task<PaymentResponseDto?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);

            return payment is null ? null : MapToDto(payment);
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetAllAsync()
        {
            var payments = await _context.Payments
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments.Select(MapToDto);
        }

        public async Task SendReminderAsync(Guid appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null) throw new InvalidOperationException("Appointment not found");

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
            if (payment != null && payment.Status == PaymentStatus.Paid) return;

            try
            {
                await _emailService.SendPaymentReminderAsync(
                    appointment.Patient.Email,
                    appointment.Patient.FullName,
                    appointment.Doctor.User.FullName,
                    appointment.AppointmentDate,
                    appointment.Doctor.ConsultationFee,
                    $"http://localhost:5173/patient-portal?token=manual");
            }
            catch { }
        }

        public async Task<byte[]> GenerateReceiptPdfAsync(Guid appointmentId)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId && p.Status == PaymentStatus.Paid);

            if (payment is null) throw new InvalidOperationException("Payment not found");

            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment is null) throw new InvalidOperationException("No appointment found");

            QuestPDF.Settings.License = LicenseType.Community;

            
            string SafeSubstring(string? str, int maxLength)
            {
                if (string.IsNullOrEmpty(str)) return "N/A";
                return str.Length >= maxLength ? str[..maxLength] : str;
            }

            var shortTransactionId = SafeSubstring(payment.TransactionId, 12);
            var shortAppointmentId = SafeSubstring(appointmentId.ToString(), 8);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(0);
                    page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(11).FontColor("#1e293b"));

                    page.Content().Column(col =>
                    {
                        col.Item().Background("#0f766e").Height(8);

                        col.Item().Background("#134e4a").Padding(36).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("🏥 Hospital Management")
                                    .FontSize(22).Bold().FontColor("#ffffff");
                                c.Item().Text("Rəsmi Ödəniş Qəbzi")
                                    .FontSize(12).FontColor("#99f6e4").Italic();
                            });
                            row.ConstantItem(160).AlignRight().Column(c =>
                            {
                                c.Item().Background("#0f766e").Padding(12).AlignCenter().Column(inner =>
                                {
                                    inner.Item().Text("✓ TƏSDİQLƏNDİ").FontSize(13).Bold().FontColor("#ffffff");
                                    inner.Item().Height(4);
                                    inner.Item().Text(payment.CreatedAt.ToString("dd.MM.yyyy")).FontSize(10).FontColor("#ccfbf1").AlignCenter();
                                });
                            });
                        });

                        col.Item().Background("#f0fdf4").PaddingHorizontal(36).PaddingVertical(14).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Tranzaksiya ID").FontSize(9).FontColor("#64748b").Bold();
                                c.Item().Text(payment.TransactionId).FontSize(13).FontColor("#059669").Bold();
                            });
                            row.ConstantItem(1).Background("#d1fae5");
                            row.ConstantItem(160).PaddingLeft(20).Column(c =>
                            {
                                c.Item().Text("Ödəniş Tarixi").FontSize(9).FontColor("#64748b").Bold();
                                c.Item().Text(payment.CreatedAt.ToString("dd.MM.yyyy HH:mm")).FontSize(11).FontColor("#1e293b").Bold();
                            });
                        });

                        col.Item().PaddingHorizontal(36).PaddingTop(24).Column(main =>
                        {
                            main.Item().Row(row =>
                            {
                                row.RelativeItem().Border(1).BorderColor("#e2e8f0").Padding(16).Column(c =>
                                {
                                    c.Item().Background("#f8fafc").Padding(8).Text("👤 Xəstə Məlumatları")
                                        .FontSize(10).Bold().FontColor("#0f766e");
                                    c.Item().Height(8);
                                    c.Item().Text(appointment.Patient.FullName).FontSize(13).Bold();
                                    c.Item().Height(4);
                                    c.Item().Text(appointment.Patient.Email ?? "-").FontSize(10).FontColor("#64748b");
                                });

                                row.ConstantItem(16);

                                row.RelativeItem().Border(1).BorderColor("#e2e8f0").Padding(16).Column(c =>
                                {
                                    c.Item().Background("#f8fafc").Padding(8).Text("🩺 Həkim Məlumatları")
                                        .FontSize(10).Bold().FontColor("#0f766e");
                                    c.Item().Height(8);
                                    c.Item().Text($"Dr. {appointment.Doctor.User.FullName}").FontSize(13).Bold();
                                    c.Item().Height(4);
                                    c.Item().Text(appointment.Doctor.Department.Name).FontSize(10).FontColor("#64748b");
                                    c.Item().Text(appointment.Doctor.Specialization).FontSize(10).FontColor("#64748b");
                                });
                            });

                            main.Item().Height(20);

                            main.Item().Text("Randevu Məlumatları").FontSize(12).Bold().FontColor("#0f766e");
                            main.Item().Height(8);

                            main.Item().Border(1).BorderColor("#e2e8f0").Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(3);
                                });

                                void Row(string label, string value, bool alt = false)
                                {
                                    var bg = alt ? "#f8fafc" : "#ffffff";
                                    table.Cell().Background(bg).BorderBottom(1).BorderColor("#f1f5f9")
                                        .PaddingHorizontal(14).PaddingVertical(10)
                                        .Text(label).FontSize(10).FontColor("#64748b");
                                    table.Cell().Background(bg).BorderBottom(1).BorderColor("#f1f5f9")
                                        .PaddingHorizontal(14).PaddingVertical(10)
                                        .Text(value).FontSize(10).Bold();
                                }

                                Row("Randevu Tarixi", appointment.AppointmentDate.ToString("dd.MM.yyyy HH:mm"), true);
                                Row("Şöbə", appointment.Doctor.Department.Name);
                                Row("Kart Nömrəsi", $"•••• •••• •••• {payment.CardLast4}", true);
                                Row("Kart Sahibi", payment.CardHolderName);
                                Row("Ödəniş Üsulu", "Kredit/Debet Kart", true);
                                Row("Status", "Ödənildi ✓");
                            });

                            main.Item().Height(24);

                            main.Item().Background("#134e4a").Padding(20).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text("Ümumi Ödənilən Məbləğ").FontSize(12).FontColor("#99f6e4");
                                    c.Item().Text("Vergi daxil").FontSize(9).FontColor("#5eead4");
                                });
                                row.ConstantItem(200).AlignRight().Column(c =>
                                {
                                    c.Item().Text($"{payment.Amount} ₼").FontSize(28).Bold().FontColor("#ffffff");
                                });
                            });

                            main.Item().Height(24);

                            main.Item().Background("#fffbeb").Border(1).BorderColor("#fde68a")
                                .Padding(12).Text("⚠️  Bu qəbzi saxlayın. Suallarınız üçün resepsiyonla əlaqə saxlayın.")
                                .FontSize(9).FontColor("#92400e");
                        });

                       
                        col.Item().PaddingTop(20).Background("#f1f5f9").PaddingHorizontal(36).PaddingVertical(16).Row(row =>
                        {
                            row.RelativeItem().Text($"Qəbz #{shortTransactionId}").FontSize(9).FontColor("#94a3b8");
                            row.RelativeItem().AlignCenter().Text("© 2025 Hospital Management").FontSize(9).FontColor("#94a3b8");
                            row.RelativeItem().AlignRight().Text($"Çap tarixi: {DateTime.Now:dd.MM.yyyy HH:mm}").FontSize(9).FontColor("#94a3b8");
                        });

                        col.Item().Background("#0f766e").Height(6);
                    });
                });
            });

            return pdf.GeneratePdf();
        }

        private static PaymentResponseDto MapToDto(Payment p) => new()
        {
            Id = p.Id,
            AppointmentId = p.AppointmentId,
            Amount = p.Amount,
            CardLast4 = p.CardLast4,
            CardHolderName = p.CardHolderName,
            TransactionId = p.TransactionId,
            Status = p.Status.ToString(),
            FailureReason = p.FailureReason,
            CreatedAt = p.CreatedAt
        };
    }
}