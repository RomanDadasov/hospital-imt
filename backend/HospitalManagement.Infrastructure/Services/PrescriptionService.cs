using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;

namespace HospitalManagement.Infrastructure.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PrescriptionService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto, string doctorUserId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId)
                ?? throw new KeyNotFoundException("Appointment not found");

            var qrCode = Guid.NewGuid().ToString("N");

            var prescription = new Prescription
            {
                Id = Guid.NewGuid(),
                AppointmentId = dto.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorName = appointment.Doctor.User.FullName,
                DoctorSpecialization = appointment.Doctor.Specialization,
                Diagnosis = dto.Diagnosis,
                Notes = dto.Notes,
                QrCode = qrCode,
                PrescribedAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                Items = dto.Items.Select(i => new PrescriptionItem
                {
                    Id = Guid.NewGuid(),
                    MedicineName = i.MedicineName,
                    Dosage = i.Dosage,
                    Frequency = i.Frequency,
                    DurationDays = i.DurationDays,
                    Instructions = i.Instructions
                }).ToList()
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            var result = await GetByIdAsync(prescription.Id);
            var pdf = await GeneratePdfAsync(prescription.Id);

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendPrescriptionAsync(
                        appointment.Patient.Email,
                        appointment.Patient.FullName,
                        appointment.Doctor.User.FullName,
                        dto.Diagnosis,
                        pdf);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"RESEPT EMAIL XETA: {ex.Message}");
                }
            });

            return result!;
        }

        public async Task<PrescriptionResponseDto?> GetByIdAsync(Guid id)
        {
            var p = await _context.Prescriptions
                .Include(x => x.Patient)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id);
            return p is null ? null : MapToDto(p);
        }

        public async Task<PrescriptionResponseDto?> GetByQrCodeAsync(string qrCode)
        {
            var p = await _context.Prescriptions
                .Include(x => x.Patient)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.QrCode == qrCode);
            return p is null ? null : MapToDto(p);
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetByAppointmentIdAsync(Guid appointmentId)
        {
            var list = await _context.Prescriptions
                .Include(x => x.Patient)
                .Include(x => x.Items)
                .Where(x => x.AppointmentId == appointmentId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
            return list.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            var list = await _context.Prescriptions
                .Include(x => x.Patient)
                .Include(x => x.Items)
                .Where(x => x.PatientId == patientId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
            return list.Select(MapToDto);
        }

        public async Task<bool> DispenseAsync(string qrCode)
        {
            var p = await _context.Prescriptions.FirstOrDefaultAsync(x => x.QrCode == qrCode);
            if (p is null || p.IsDispensed) return false;
            p.IsDispensed = true;
            p.DispensedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> GeneratePdfAsync(Guid id)
        {
            var p = await _context.Prescriptions
                .Include(x => x.Patient)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new KeyNotFoundException("Prescription not found");

            QuestPDF.Settings.License = LicenseType.Community;

            var qrImageBytes = GenerateQrCodeImage(
                $"http://localhost:5173/pharmacy?qr={p.QrCode}");

            return QuestPDF.Fluent.Document.Create(c => c.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("MedCare Hospital").FontSize(20).Bold().FontColor(Colors.Teal.Darken2);
                            c.Item().Text("E-Resept / E-Prescription").FontSize(11).FontColor(Colors.Grey.Darken1);
                        });
                        row.ConstantItem(120).Column(c =>
                        {
                            c.Item().AlignRight().Text($"#{p.Id.ToString()[..8].ToUpper()}").FontSize(10).FontColor(Colors.Grey.Darken1);
                            c.Item().AlignRight().Text(p.PrescribedAt.ToString("dd.MM.yyyy")).FontSize(10);
                        });
                    });
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Teal.Lighten2);
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                {
                    // Xəstə məlumatları
                    col.Item().Background(Colors.Teal.Lighten5).Border(1).BorderColor(Colors.Teal.Lighten3).Padding(12).Column(c =>
                    {
                        c.Item().Text("Xəstə / Patient").Bold().FontColor(Colors.Teal.Darken2);
                        c.Item().Text(p.Patient.FullName).FontSize(14).Bold();
                        c.Item().Text($"Email: {p.Patient.Email}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        if (!string.IsNullOrEmpty(p.Patient.Phone))
                            c.Item().Text($"Tel: {p.Patient.Phone}").FontSize(10).FontColor(Colors.Grey.Darken1);
                    });

                    col.Item().PaddingTop(10).Column(c =>
                    {
                        c.Item().Text("Həkim / Doctor").Bold().FontColor(Colors.Teal.Darken2);
                        c.Item().Text($"Dr. {p.DoctorName}").FontSize(13).Bold();
                        c.Item().Text(p.DoctorSpecialization).FontSize(10).FontColor(Colors.Grey.Darken1);
                    });

                    col.Item().PaddingTop(10).Column(c =>
                    {
                        c.Item().Text("Diaqnoz / Diagnosis").Bold().FontColor(Colors.Teal.Darken2);
                        c.Item().Text(p.Diagnosis).FontSize(12);
                    });

                    col.Item().PaddingTop(15).Column(c =>
                    {
                        c.Item().Text("Dərmanlar / Medications").Bold().FontSize(13).FontColor(Colors.Teal.Darken2);
                        c.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(cd =>
                            {
                                cd.ConstantColumn(30);
                                cd.RelativeColumn(3);
                                cd.RelativeColumn(2);
                                cd.RelativeColumn(2);
                                cd.RelativeColumn(1);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Background(Colors.Teal.Darken2).Padding(6).Text("#").FontColor(Colors.White).Bold().FontSize(10);
                                h.Cell().Background(Colors.Teal.Darken2).Padding(6).Text("Dərman").FontColor(Colors.White).Bold().FontSize(10);
                                h.Cell().Background(Colors.Teal.Darken2).Padding(6).Text("Doz").FontColor(Colors.White).Bold().FontSize(10);
                                h.Cell().Background(Colors.Teal.Darken2).Padding(6).Text("Tezlik").FontColor(Colors.White).Bold().FontSize(10);
                                h.Cell().Background(Colors.Teal.Darken2).Padding(6).Text("Gün").FontColor(Colors.White).Bold().FontSize(10);
                            });

                            var items = p.Items.ToList();
                            for (int i = 0; i < items.Count; i++)
                            {
                                var item = items[i];
                                var bg = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                                table.Cell().Background(bg).Padding(6).Text($"{i + 1}").FontSize(10);
                                table.Cell().Background(bg).Padding(6).Column(mc =>
                                {
                                    mc.Item().Text(item.MedicineName).Bold().FontSize(10);
                                    if (!string.IsNullOrEmpty(item.Instructions))
                                        mc.Item().Text(item.Instructions).FontSize(9).FontColor(Colors.Grey.Darken1).Italic();
                                });
                                table.Cell().Background(bg).Padding(6).Text(item.Dosage).FontSize(10);
                                table.Cell().Background(bg).Padding(6).Text(item.Frequency).FontSize(10);
                                table.Cell().Background(bg).Padding(6).Text($"{item.DurationDays}").FontSize(10);
                            }
                        });
                    });

                    if (!string.IsNullOrEmpty(p.Notes))
                    {
                        col.Item().PaddingTop(10).Background(Colors.Yellow.Lighten4).Border(1).BorderColor(Colors.Yellow.Lighten2).Padding(10).Column(c =>
                        {
                            c.Item().Text("Qeydlər / Notes").Bold().FontColor(Colors.Orange.Darken2);
                            c.Item().Text(p.Notes).FontSize(10).Italic();
                        });
                    }

                    // QR kod
                    col.Item().PaddingTop(15).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(12).Row(row =>
                    {
                        row.ConstantItem(80).Image(qrImageBytes);
                        row.RelativeItem().PaddingLeft(12).Column(c =>
                        {
                            c.Item().Text("QR Kod / Verification").Bold().FontColor(Colors.Teal.Darken2);
                            c.Item().Text($"Kod: {p.QrCode}").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().PaddingTop(4).Text("Bu resepti aptek sistemində skan edin").FontSize(9).FontColor(Colors.Grey.Darken1).Italic();
                            c.Item().PaddingTop(4).Text(p.IsDispensed ? "✓ Verilmiş" : "Gözləyir").FontSize(10).Bold()
                                .FontColor(p.IsDispensed ? Colors.Green.Darken2 : Colors.Orange.Darken2);
                        });
                    });
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("MedCare Hospital Management | ").FontSize(9).FontColor(Colors.Grey.Darken1);
                    t.Span(DateTimeOffset.UtcNow.ToString("dd.MM.yyyy HH:mm")).FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            })).GeneratePdf();
        }

        private static byte[] GenerateQrCodeImage(string text)
        {
            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(qrCodeData);
            return qrCode.GetGraphic(10);
        }

        private static PrescriptionResponseDto MapToDto(Prescription p) => new()
        {
            Id = p.Id,
            AppointmentId = p.AppointmentId,
            PatientId = p.PatientId,
            PatientName = p.Patient.FullName,
            PatientEmail = p.Patient.Email,
            DoctorName = p.DoctorName,
            DoctorSpecialization = p.DoctorSpecialization,
            Diagnosis = p.Diagnosis,
            Items = p.Items.Select(i => new PrescriptionItemDto
            {
                MedicineName = i.MedicineName,
                Dosage = i.Dosage,
                Frequency = i.Frequency,
                DurationDays = i.DurationDays,
                Instructions = i.Instructions
            }).ToList(),
            Notes = p.Notes,
            PrescribedAt = p.PrescribedAt,
            QrCode = p.QrCode,
            IsDispensed = p.IsDispensed,
            DispensedAt = p.DispensedAt
        };
    }
}