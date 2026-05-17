using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HospitalManagement.Infrastructure.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly AppDbContext _context;
        private readonly IAuditService _auditService;

        public MedicalRecordService(AppDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            return await _context.MedicalRecords
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.RecordDate)
                .Select(r => new MedicalRecordResponseDto
                {
                    Id = r.Id,
                    PatientId = r.PatientId,
                    PatientName = r.Patient.FullName,
                    AppointmentId = r.AppointmentId,
                    DoctorName = r.DoctorName,
                    Department = r.Department,
                    Diagnosis = r.Diagnosis,
                    Treatment = r.Treatment,
                    Prescription = r.Prescription,
                    Notes = r.Notes,
                    RecordDate = r.RecordDate,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<MedicalRecordResponseDto?> GetByIdAsync(Guid id)
        {
            var r = await _context.MedicalRecords
                .Include(x => x.Patient)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (r is null) return null;

            return new MedicalRecordResponseDto
            {
                Id = r.Id,
                PatientId = r.PatientId,
                PatientName = r.Patient.FullName,
                AppointmentId = r.AppointmentId,
                DoctorName = r.DoctorName,
                Department = r.Department,
                Diagnosis = r.Diagnosis,
                Treatment = r.Treatment,
                Prescription = r.Prescription,
                Notes = r.Notes,
                RecordDate = r.RecordDate,
                CreatedAt = r.CreatedAt
            };
        }

        public async Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto, string userId, string userFullName)
        {
            var record = new MedicalRecord
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                AppointmentId = dto.AppointmentId,
                DoctorName = dto.DoctorName,
                Department = dto.Department,
                Diagnosis = dto.Diagnosis,
                Treatment = dto.Treatment,
                Prescription = dto.Prescription,
                Notes = dto.Notes,
                RecordDate = dto.RecordDate,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedByUserId = userId
            };

            _context.MedicalRecords.Add(record);
            await _context.SaveChangesAsync();

            await _context.Entry(record).Reference(r => r.Patient).LoadAsync();

            await _auditService.LogAsync(userId, userFullName,
                "Created", "MedicalRecord", record.Id.ToString(),
                $"{record.Patient.FullName} | {dto.Diagnosis}");

            return (await GetByIdAsync(record.Id))!;
        }

        public async Task<MedicalRecordResponseDto?> UpdateAsync(Guid id, UpdateMedicalRecordDto dto, string userId, string userFullName)
        {
            var record = await _context.MedicalRecords.FindAsync(id);
            if (record is null) return null;

            record.Diagnosis = dto.Diagnosis;
            record.Treatment = dto.Treatment;
            record.Prescription = dto.Prescription;
            record.Notes = dto.Notes;
            record.RecordDate = dto.RecordDate;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(userId, userFullName,
                "Updated", "MedicalRecord", id.ToString(),
                $"Diaqnoz: {dto.Diagnosis}");

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id, string userId, string userFullName)
        {
            var record = await _context.MedicalRecords
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (record is null) return false;

            await _auditService.LogAsync(userId, userFullName,
                "Deleted", "MedicalRecord", id.ToString(),
                $"{record.Patient.FullName} | {record.Diagnosis}");

            _context.MedicalRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> GeneratePatientHistoryPdfAsync(Guid patientId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == patientId)
                ?? throw new KeyNotFoundException("Patient not found");

            var records = await _context.MedicalRecords
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.RecordDate)
                .ToListAsync();

            QuestPDF.Settings.License = LicenseType.Community;

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
                            c.Item().Text("Tibbi Tarixçə / Medical History").FontSize(11).FontColor(Colors.Grey.Darken1);
                        });
                        row.ConstantItem(120).Column(c =>
                        {
                            c.Item().AlignRight().Text(DateTime.Now.ToString("dd.MM.yyyy")).FontSize(10).FontColor(Colors.Grey.Darken1);
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
                        c.Item().Text(patient.FullName).FontSize(14).Bold();
                        c.Item().Text($"Email: {patient.Email}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        if (!string.IsNullOrEmpty(patient.Phone))
                            c.Item().Text($"Tel: {patient.Phone}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        if (patient.DateOfBirth.HasValue)
                            c.Item().Text($"Doğum tarixi: {patient.DateOfBirth.Value:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1);
                    });

                    col.Item().PaddingTop(10).Text($"Cəmi {records.Count} tibbi qeyd tapıldı")
                        .FontSize(10).FontColor(Colors.Grey.Darken1).Italic();

                    if (records.Count == 0)
                    {
                        col.Item().PaddingTop(20).AlignCenter()
                            .Text("Tibbi qeyd tapılmadı").FontSize(12).FontColor(Colors.Grey.Darken1).Italic();
                    }
                    else
                    {
                        foreach (var record in records)
                        {
                            col.Item().PaddingTop(12).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(12).Column(c =>
                            {
                                // Diaqnoz + tarix header
                                c.Item().Row(row =>
                                {
                                    row.RelativeItem().Text(record.Diagnosis).Bold().FontSize(12).FontColor(Colors.Teal.Darken2);
                                    row.ConstantItem(120).AlignRight()
                                        .Text(record.RecordDate.ToString("dd.MM.yyyy"))
                                        .FontSize(10).FontColor(Colors.Grey.Darken1);
                                });

                                if (!string.IsNullOrEmpty(record.DoctorName))
                                {
                                    c.Item().PaddingTop(6).Row(row =>
                                    {
                                        row.ConstantItem(100).Text("Həkim:").Bold().FontSize(10).FontColor(Colors.Grey.Darken1);
                                        row.RelativeItem().Text(record.DoctorName).FontSize(10);
                                    });
                                }

                                if (!string.IsNullOrEmpty(record.Department))
                                {
                                    c.Item().PaddingTop(4).Row(row =>
                                    {
                                        row.ConstantItem(100).Text("Şöbə:").Bold().FontSize(10).FontColor(Colors.Grey.Darken1);
                                        row.RelativeItem().Text(record.Department).FontSize(10);
                                    });
                                }

                                if (!string.IsNullOrEmpty(record.Treatment))
                                {
                                    c.Item().PaddingTop(4).Row(row =>
                                    {
                                        row.ConstantItem(100).Text("Müalicə:").Bold().FontSize(10).FontColor(Colors.Grey.Darken1);
                                        row.RelativeItem().Text(record.Treatment).FontSize(10);
                                    });
                                }

                                if (!string.IsNullOrEmpty(record.Prescription))
                                {
                                    c.Item().PaddingTop(4).Row(row =>
                                    {
                                        row.ConstantItem(100).Text("Resept:").Bold().FontSize(10).FontColor(Colors.Grey.Darken1);
                                        row.RelativeItem().Text(record.Prescription).FontSize(10);
                                    });
                                }

                                if (!string.IsNullOrEmpty(record.Notes))
                                {
                                    c.Item().PaddingTop(4).Row(row =>
                                    {
                                        row.ConstantItem(100).Text("Qeydlər:").Bold().FontSize(10).FontColor(Colors.Grey.Darken1);
                                        row.RelativeItem().Text(record.Notes).FontSize(10).Italic().FontColor(Colors.Grey.Darken1);
                                    });
                                }
                            });
                        }
                    }
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("MedCare Hospital Management | ").FontSize(9).FontColor(Colors.Grey.Darken1);
                    t.Span(DateTimeOffset.UtcNow.ToString("dd.MM.yyyy HH:mm")).FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            })).GeneratePdf();
        }
    }
}