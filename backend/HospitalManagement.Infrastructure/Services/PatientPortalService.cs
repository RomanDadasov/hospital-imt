using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using HospitalManagement.Services;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Services
{
    public class PatientPortalService : IPatientPortalService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PatientPortalService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<string> GeneratePortalTokenAsync(Guid patientId)
        {
            var patient = await _context.Patients.FindAsync(patientId)
                ?? throw new KeyNotFoundException("Patient not found");

            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            patient.PortalToken = token;
            patient.PortalTokenExpiry = DateTimeOffset.UtcNow.AddDays(30);
            await _context.SaveChangesAsync();
            return token;
        }

        public async Task<PatientPortalDto?> GetPortalDataAsync(string token)
        {
           
            var patient = await _context.Patients
                .Include(p => p.Appointments)
                .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.User)
                .Include(p => p.Appointments)
                .ThenInclude(a => a.Doctor)
                .ThenInclude(d => d.Department)
                .Include(p => p.Appointments)
                .ThenInclude(a => a.Payment)
                .FirstOrDefaultAsync(p => p.PortalToken == token);

            if (patient is null) return null;

           
            if (patient.PortalTokenExpiry <= DateTimeOffset.UtcNow)
            {
                patient.PortalToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                patient.PortalTokenExpiry = DateTimeOffset.UtcNow.AddDays(30);
                await _context.SaveChangesAsync();
            }

            return new PatientPortalDto
            {
                PatientId = patient.Id,
                PatientName = patient.FullName,
                Email = patient.Email,
                Phone = patient.Phone,
                Appointments = patient.Appointments
                    .Where(a => a.DeletedAt == null)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new PortalAppointmentDto
                    {
                        Id = a.Id,
                        DoctorName = a.Doctor.User.FullName,
                        Department = a.Doctor.Department.Name,
                        AppointmentDate = a.AppointmentDate,
                        Status = a.Status.ToString(),
                        ConsultationFee = a.Doctor.ConsultationFee,
                        IsPaid = a.Payment != null && a.Payment.Status == PaymentStatus.Paid,
                        PaymentStatus = a.Payment?.Status.ToString()
                    }).ToList()
            };
        }

        public async Task<bool> PayAsync(string token, Guid appointmentId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p =>
                    p.PortalToken == token &&
                    p.PortalTokenExpiry > DateTimeOffset.UtcNow);

            if (patient is null) return false;

            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.PatientId == patient.Id);

            if (appointment is null) return false;

            if (appointment.Payment != null && appointment.Payment.Status == PaymentStatus.Paid)
                return false;

            if (appointment.Payment is null)
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    AppointmentId = appointmentId,
                    Amount = appointment.Doctor.ConsultationFee,
                    Status = PaymentStatus.Paid,
                    PaidAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.Payments.Add(payment);
            }
            else
            {
                appointment.Payment.Status = PaymentStatus.Paid;
                appointment.Payment.PaidAt = DateTimeOffset.UtcNow;
            }

            appointment.Status = AppointmentStatus.Confirmed;
            await _context.SaveChangesAsync();

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendPaymentConfirmedAsync(
                        appointment.Patient.Email,
                        appointment.Patient.FullName,
                        appointment.Doctor.ConsultationFee,
                        appointmentId);
                }
                catch { }
            });

            return true;
        }
    }
}
