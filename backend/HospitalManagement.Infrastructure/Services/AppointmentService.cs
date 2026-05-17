using AutoMapper;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using HospitalManagement.Repositories;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WColor = DocumentFormat.OpenXml.Wordprocessing.Color;
using WDocument = DocumentFormat.OpenXml.Wordprocessing.Document;
using WFontSize = DocumentFormat.OpenXml.Wordprocessing.FontSize;


namespace HospitalManagement.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly IPatientPortalService _portalService;


        public AppointmentService(IAppointmentRepository repository, IMapper mapper, IEmailService emailService, INotificationService notificationService, IAuditService auditService, IPatientPortalService portalService)
        {
            _repository = repository;
            _mapper = mapper;
            _emailService = emailService;
            _notificationService = notificationService;
            _auditService = auditService;
            _portalService = portalService;
        }

        public async Task<PagedResult<AppointmentResponseDto>> GetAllAsync(AppointmentQueryParameters parameters)
        {
            var all = await _repository.GetAllActiveAsync();
            var query = all.AsQueryable();

            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                var term = parameters.SearchTerm.ToLower();
                query = query.Where(a =>
                    a.Patient.FullName.ToLower().Contains(term) ||
                    a.Doctor.User.FullName.ToLower().Contains(term));
            }

            if (parameters.DoctorId.HasValue)
                query = query.Where(a => a.DoctorId == parameters.DoctorId.Value);

            if (parameters.PatientId.HasValue)
                query = query.Where(a => a.PatientId == parameters.PatientId.Value);

            if (!string.IsNullOrWhiteSpace(parameters.Status))
            {
                if (Enum.TryParse<AppointmentStatus>(parameters.Status, true, out var status))
                    query = query.Where(a => a.Status == status);
            }

            if (parameters.DateFrom.HasValue)
                query = query.Where(a => a.AppointmentDate >= parameters.DateFrom.Value);

            if (parameters.DateTo.HasValue)
                query = query.Where(a => a.AppointmentDate <= parameters.DateTo.Value);

            var totalCount = query.Count();
            var items = query
                .Skip((parameters.Page - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToList();

            return PagedResult<AppointmentResponseDto>.Create(
                _mapper.Map<List<AppointmentResponseDto>>(items),
                parameters.Page, parameters.PageSize, totalCount);
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(Guid id)
        {
            var appointment = await _repository.GetWithDetailsAsync(id);
            if (appointment is null) return null;
            return _mapper.Map<AppointmentResponseDto>(appointment);
        }

        public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto, string createdByUserId, string createdByUserFullName)
        {
            var appointment = _mapper.Map<Appointment>(dto);
            appointment.Id = Guid.NewGuid();
            appointment.CreatedByUserId = createdByUserId;
            await _repository.AddAsync(appointment);
            await _repository.SaveChangesAsync();
            var created = await _repository.GetWithDetailsAsync(appointment.Id);

            await _auditService.LogAsync(
                createdByUserId, createdByUserFullName,
                "Created", "Appointment",
                appointment.Id.ToString(),
                $"{created!.Patient.FullName} → Dr. {created.Doctor.User.FullName} | {created.AppointmentDate:dd.MM.yyyy HH:mm}");

            _ = Task.Run(async () =>
            {
                try
                {
                    var token = await _portalService.GeneratePortalTokenAsync(created!.Patient.Id);
                    var portalLink = $"http://localhost:5173/patient-portal?token={token}";

                    await _emailService.SendAppointmentCreatedAsync(
                        created.Patient.Email,
                        created.Patient.FullName,
                        created.Doctor.User.FullName,
                        created.AppointmentDate,
                        portalLink);
                }
                catch { }

                try
                {
                    await _notificationService.SendAppointmentCreatedAsync(
                        created!.Patient.FullName,
                        created.Doctor.User.FullName,
                        created.AppointmentDate);
                }
                catch { }
            });

            return _mapper.Map<AppointmentResponseDto>(created!);
        }

        public async Task<AppointmentResponseDto?> UpdateAsync(Guid id, UpdateAppointmentDto dto)
        {
            var appointment = await _repository.GetWithDetailsAsync(id);
            if (appointment is null) return null;
            if (appointment.Status != AppointmentStatus.Pending) return null;

            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.Notes = dto.Notes;
            appointment.UpdatedAt = DateTimeOffset.UtcNow;

            await _repository.UpdateAsync(appointment);
            await _repository.SaveChangesAsync();
            return _mapper.Map<AppointmentResponseDto>(appointment);
        }

        public async Task<bool> DeleteAsync(Guid id, string userId, string userFullName)
        {
            var appointment = await _repository.GetWithDetailsAsync(id);
            if (appointment is null) return false;

            await _auditService.LogAsync(
                userId, userFullName,
                "Deleted", "Appointment",
                id.ToString(),
                $"{appointment.Patient.FullName} → Dr. {appointment.Doctor.User.FullName}");

            await _repository.DeleteAsync(appointment);
            await _repository.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ArchiveAsync(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment is null) return false;
            appointment.DeletedAt = DateTimeOffset.UtcNow;
            await _repository.UpdateAsync(appointment);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<AppointmentResponseDto?> ChangeStatusAsync(Guid id, ChangeAppointmentStatusDto dto, string userId, string userFullName)
        {
            var appointment = await _repository.GetWithDetailsAsync(id);
            if (appointment is null) return null;

            var oldStatus = appointment.Status.ToString();
            appointment.Status = dto.Status;
            appointment.UpdatedAt = DateTimeOffset.UtcNow;
            await _repository.UpdateAsync(appointment);
            await _repository.SaveChangesAsync();

            await _auditService.LogAsync(
                userId, userFullName,
                "StatusChanged", "Appointment",
                id.ToString(),
                $"{appointment.Patient.FullName} | {oldStatus} → {dto.Status}");

            _ = Task.Run(async () =>
            {
                try
                {
                    switch (dto.Status)
                    {
                        case AppointmentStatus.Confirmed:
                            await _emailService.SendAppointmentConfirmedAsync(appointment.Patient.Email, appointment.Patient.FullName, appointment.Doctor.User.FullName, appointment.AppointmentDate);
                            break;
                        case AppointmentStatus.Cancelled:
                            await _emailService.SendAppointmentCancelledAsync(appointment.Patient.Email, appointment.Patient.FullName, appointment.Doctor.User.FullName, appointment.AppointmentDate);
                            break;
                        case AppointmentStatus.Completed:
                            await _emailService.SendAppointmentCompletedAsync(appointment.Patient.Email, appointment.Patient.FullName, appointment.Doctor.User.FullName, appointment.AppointmentDate);
                            break;
                    }
                }
                catch { }
                try { await _notificationService.SendAppointmentStatusChangedAsync(appointment.Patient.FullName, dto.Status.ToString()); } catch { }
            });

            return _mapper.Map<AppointmentResponseDto>(appointment);
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetByDoctorUserIdAsync(string userId, string? status = null, int page = 1, int pageSize = 20)
        {
            var items = await _repository.GetByDoctorUserIdPagedAsync(userId, status, page, pageSize);
            return _mapper.Map<IEnumerable<AppointmentResponseDto>>(items);
        }

        public async Task<AppointmentStatsDto> GetStatsAsync()
        {
            var all = await _repository.GetAllActiveAsync();

            return new AppointmentStatsDto
            {
                Total = all.Count(),
                Confirmed = all.Count(a => a.Status == AppointmentStatus.Confirmed),
                Completed = all.Count(a => a.Status == AppointmentStatus.Completed),
                Cancelled = all.Count(a => a.Status == AppointmentStatus.Cancelled),
                Pending = all.Count(a => a.Status == AppointmentStatus.Pending),
                Monthly = Enumerable.Range(0, 12)
                                .Select(m => all.Count(a => a.AppointmentDate.Month == m + 1))
                                .ToList(),
                ByDoctor = all.GroupBy(a => a.Doctor.User.FullName)
                                .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
                                .OrderByDescending(x => x.Count).Take(8).ToList(),
                ByDept = all.GroupBy(a => a.Doctor.Department.Name)
                                .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
                                .OrderByDescending(x => x.Count).ToList(),
                ByStatus = all.GroupBy(a => a.Status.ToString())
                                .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
                                .ToList(),
            };
        }

        public async Task<byte[]> GeneratePdfAsync(Guid id)
        {
            var apt = await _repository.GetWithDetailsAsync(id)
                      ?? throw new KeyNotFoundException("Appointment not found");

            QuestPDF.Settings.License = LicenseType.Community;

            return QuestPDF.Fluent.Document.Create(c => c.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("APPOINTMENT").FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
                        col.Item().Text($"#{apt.Id.ToString()[..8].ToUpper()}").FontSize(12).FontColor(Colors.Grey.Darken1);
                    });
                    row.ConstantItem(160).Column(col =>
                    {
                        col.Item().AlignRight().Text($"Date: {apt.CreatedAt:dd.MM.yyyy}").FontSize(10);
                        col.Item().AlignRight().Text($"Status: {apt.Status}").FontSize(10).Bold();
                    });
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                {
                    col.Item().Background(Colors.Grey.Lighten3).Padding(10).Column(info =>
                    {
                        info.Item().Text("Patient:").Bold();
                        info.Item().Text(apt.Patient.FullName).FontSize(13).Bold();
                        info.Item().Text($"Email: {apt.Patient.Email}");
                        info.Item().Text($"Phone: {apt.Patient.Phone}");
                    });

                    col.Item().PaddingTop(15).Background(Colors.Grey.Lighten4).Padding(10).Column(info =>
                    {
                        info.Item().Text("Doctor:").Bold();
                        info.Item().Text(apt.Doctor.User.FullName).FontSize(13).Bold();
                        info.Item().Text($"Department: {apt.Doctor.Department.Name}");
                        info.Item().Text($"Specialization: {apt.Doctor.Specialization}");
                    });

                    col.Item().PaddingTop(15).Column(info =>
                    {
                        info.Item().Text("Appointment Details:").Bold();
                        info.Item().Text($"Date & Time: {apt.AppointmentDate:dd.MM.yyyy HH:mm}");
                        info.Item().Text($"Status: {apt.Status}");
                        if (!string.IsNullOrEmpty(apt.Notes))
                            info.Item().Text($"Notes: {apt.Notes}").Italic();
                    });
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Generated by Hospital Management | ").FontSize(9).FontColor(Colors.Grey.Darken1);
                    t.Span(DateTimeOffset.UtcNow.ToString("dd.MM.yyyy HH:mm")).FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            })).GeneratePdf();
        }

        public async Task<byte[]> GenerateDocxAsync(Guid id)
        {
            var apt = await _repository.GetWithDetailsAsync(id)
                      ?? throw new KeyNotFoundException("Appointment not found");

            using var stream = new MemoryStream();
            using var wordDoc = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document);

            var body = new Body();
            wordDoc.AddMainDocumentPart().Document = new WDocument(body);

            static Paragraph Para(string text, bool bold = false, int fs = 22, string? color = null)
            {
                var rp = new RunProperties();
                if (bold) rp.AppendChild(new Bold());
                if (fs != 22) rp.AppendChild(new WFontSize { Val = fs.ToString() });
                if (color != null) rp.AppendChild(new WColor { Val = color });
                return new Paragraph(new Run(rp, new Text(text) { Space = SpaceProcessingModeValues.Preserve }));
            }

            body.AppendChild(Para("APPOINTMENT", bold: true, fs: 48, color: "1F3864"));
            body.AppendChild(Para($"#{apt.Id.ToString()[..8].ToUpper()}", fs: 24, color: "888888"));
            body.AppendChild(new Paragraph());
            body.AppendChild(Para("PATIENT", bold: true, fs: 28, color: "1F3864"));
            body.AppendChild(Para($"Name:   {apt.Patient.FullName}", bold: true, fs: 24));
            body.AppendChild(Para($"Email:    {apt.Patient.Email}"));
            body.AppendChild(Para($"Phone:  {apt.Patient.Phone}"));
            body.AppendChild(new Paragraph());
            body.AppendChild(Para("DOCTOR", bold: true, fs: 28, color: "1F3864"));
            body.AppendChild(Para($"Name:           {apt.Doctor.User.FullName}", bold: true, fs: 24));
            body.AppendChild(Para($"Department:  {apt.Doctor.Department.Name}"));
            body.AppendChild(Para($"Specialization: {apt.Doctor.Specialization}"));
            body.AppendChild(new Paragraph());
            body.AppendChild(Para("APPOINTMENT DETAILS", bold: true, fs: 28, color: "1F3864"));
            body.AppendChild(Para($"Date & Time:  {apt.AppointmentDate:dd.MM.yyyy HH:mm}"));
            body.AppendChild(Para($"Status:           {apt.Status}"));
            if (!string.IsNullOrEmpty(apt.Notes))
                body.AppendChild(Para($"Notes:            {apt.Notes}"));

            wordDoc.Save();
            return stream.ToArray();
        }




    }
}
