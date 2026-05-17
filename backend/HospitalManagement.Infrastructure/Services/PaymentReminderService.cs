using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.Infrastructure.Services
{
    public class PaymentReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PaymentReminderService> _logger;

        public PaymentReminderService(IServiceProvider serviceProvider, ILogger<PaymentReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextRun = DateTime.Today.AddHours(9);
                if (now.Hour >= 9) nextRun = nextRun.AddDays(1);
                var delay = nextRun - now;

                await Task.Delay(delay, stoppingToken);

                try { await SendRemindersAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "Payment reminder error"); }
            }
        }

        private async Task SendRemindersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var portalService = scope.ServiceProvider.GetRequiredService<IPatientPortalService>();

            var threeDaysLater = DateTimeOffset.UtcNow.AddDays(3);

            var unpaidAppointments = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .Where(a =>
                    a.DeletedAt == null &&
                    a.AppointmentDate <= threeDaysLater &&
                    a.AppointmentDate > DateTimeOffset.UtcNow &&
                    (a.Payment == null || a.Payment.Status != PaymentStatus.Paid))
                .ToListAsync();

            _logger.LogInformation("Payment reminder: {Count} unpaid appointments found", unpaidAppointments.Count);

            foreach (var apt in unpaidAppointments)
            {
                try
                {
                    var token = await portalService.GeneratePortalTokenAsync(apt.Patient.Id);
                    var portalLink = $"http://localhost:5173/patient-portal?token={token}";

                    await emailService.SendPaymentReminderAsync(
                        apt.Patient.Email,
                        apt.Patient.FullName,
                        apt.Doctor.User.FullName,
                        apt.AppointmentDate,
                        apt.Doctor.ConsultationFee,
                        portalLink);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Reminder failed for appointment {Id}", apt.Id);
                }
            }
        }
    }
}
