using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Services
{
    public class QueueService : IQueueService
    {
        private readonly AppDbContext _context;
        private readonly IQueueHubClient _hubClient;

        public QueueService(AppDbContext context, IQueueHubClient hubClient)
        {
            _context = context;
            _hubClient = hubClient;
        }

        public async Task<QueueStateDto> GetTodayQueueAsync()
        {
            var today = DateTimeOffset.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var appointments = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Payment)
                .Where(a => a.DeletedAt == null &&
                            a.AppointmentDate >= today &&
                            a.AppointmentDate < tomorrow &&
                            (a.Status == AppointmentStatus.InQueue ||
                             a.Status == AppointmentStatus.InProgress ||
                             a.Status == AppointmentStatus.Completed))
                .OrderBy(a => a.QueueOrder)
                .ToListAsync();

            var current = appointments.FirstOrDefault(a => a.Status == AppointmentStatus.InProgress);
            var waiting = appointments.Where(a => a.Status == AppointmentStatus.InQueue).ToList();
            var completed = appointments.Where(a => a.Status == AppointmentStatus.Completed).ToList();

            var avgDuration = current != null ? await GetAverageDurationAsync(current.DoctorId) : 20;

            return new QueueStateDto
            {
                Current = current != null ? MapToQueueDto(current, 0, avgDuration) : null,
                Waiting = waiting.Select((a, i) => MapToQueueDto(a, (i + 1) * avgDuration, avgDuration)).ToList(),
                Completed = completed.Select(a => MapToQueueDto(a, 0, avgDuration)).ToList(),
                TotalToday = appointments.Count,
                AverageDurationMinutes = avgDuration
            };
        }

        public async Task<AppointmentQueueDto> AddToQueueAsync(Guid appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null) throw new InvalidOperationException("No appointment found");
            if (appointment.Payment?.Status != PaymentStatus.Paid)
                throw new InvalidOperationException("Payment has not been completed");

            var today = DateTimeOffset.UtcNow.Date;
            var todayQueueCount = await _context.Appointments
                .Where(a => a.DeletedAt == null &&
                            a.AppointmentDate >= today &&
                            a.QueueNumber != null)
                .CountAsync();

            appointment.Status = AppointmentStatus.InQueue;
            appointment.QueueNumber = (todayQueueCount + 1).ToString("D3");
            appointment.QueueOrder = todayQueueCount + 1;
            appointment.QueueEnteredAt = DateTimeOffset.UtcNow;
            appointment.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            var state = await GetTodayQueueAsync();
            await _hubClient.SendQueueUpdatedAsync(state);

            return MapToQueueDto(appointment, 0, await GetAverageDurationAsync(appointment.DoctorId));
        }

        public async Task<AppointmentQueueDto> CallNextAsync(Guid appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null) throw new InvalidOperationException("No appointment found");

            appointment.Status = AppointmentStatus.InProgress;
            appointment.InProgressAt = DateTimeOffset.UtcNow;
            appointment.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            var state = await GetTodayQueueAsync();
            await _hubClient.SendQueueUpdatedAsync(state);
            await _hubClient.SendCallPatientAsync(new
            {
                queueNumber = appointment.QueueNumber,
                doctorName = appointment.Doctor.User.FullName,
                departmentName = appointment.Doctor.Department.Name
            });

            return MapToQueueDto(appointment, 0, await GetAverageDurationAsync(appointment.DoctorId));
        }

        public async Task<AppointmentQueueDto> CompleteCurrentAsync(Guid appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null) throw new InvalidOperationException("No appointment found");

            appointment.Status = AppointmentStatus.Completed;
            appointment.CompletedAt = DateTimeOffset.UtcNow;
            appointment.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            var state = await GetTodayQueueAsync();
            await _hubClient.SendQueueUpdatedAsync(state);

            return MapToQueueDto(appointment, 0, await GetAverageDurationAsync(appointment.DoctorId));
        }

        public async Task<int> GetAverageDurationAsync(Guid doctorId)
        {
            var recentCompleted = await _context.Appointments
                .Where(a => a.DoctorId == doctorId &&
                            a.Status == AppointmentStatus.Completed &&
                            a.InProgressAt != null &&
                            a.CompletedAt != null)
                .OrderByDescending(a => a.CompletedAt)
                .Take(5)
                .ToListAsync();

            if (!recentCompleted.Any()) return 20;

            var avg = recentCompleted
                .Select(a => (a.CompletedAt!.Value - a.InProgressAt!.Value).TotalMinutes)
                .Average();

            return Math.Max(5, (int)Math.Ceiling(avg));
        }

        public async Task ResetStaleQueueAsync()
        {
            var today = DateTimeOffset.UtcNow.Date;

            var stale = await _context.Appointments
                .Where(a => a.DeletedAt == null &&
                            a.AppointmentDate < today &&
                            (a.Status == AppointmentStatus.InQueue ||
                             a.Status == AppointmentStatus.InProgress))
                .ToListAsync();

            foreach (var apt in stale)
            {
                apt.Status = AppointmentStatus.Confirmed;
                apt.QueueNumber = null;
                apt.QueueOrder = null;
                apt.QueueEnteredAt = null;
                apt.InProgressAt = null;
                apt.UpdatedAt = DateTimeOffset.UtcNow;
            }

            if (stale.Any())
                await _context.SaveChangesAsync();
        }

        private static AppointmentQueueDto MapToQueueDto(Appointment a, int waitMinutes, int avgDuration) => new()
        {
            Id = a.Id,
            QueueNumber = a.QueueNumber ?? "---",
            QueueOrder = a.QueueOrder ?? 0,
            Status = a.Status.ToString(),
            DoctorName = a.Doctor?.User?.FullName ?? "",
            DepartmentName = a.Doctor?.Department?.Name ?? "",
            AppointmentDate = a.AppointmentDate,
            InProgressAt = a.InProgressAt,
            EstimatedWaitMinutes = waitMinutes
        };
    }
}