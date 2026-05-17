using HospitalManagement.Application.Services;
using System;
using System.Collections.Generic;

namespace HospitalManagement.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationHubClient _hubClient;

        public NotificationService(INotificationHubClient hubClient)
        {
            _hubClient = hubClient;
        }

        public async Task SendAppointmentCreatedAsync(string patientName, string doctorName, DateTimeOffset date)
        {
            var payload = new
            {
                type = "AppointmentCreated",
                message = $"{patientName} — {doctorName} A meeting was scheduled with",
                date = date,
                createdAt = DateTimeOffset.UtcNow
            };

            await _hubClient.SendToGroupAsync("Admin", "ReceiveNotification", payload);
            await _hubClient.SendToGroupAsync("Receptionist", "ReceiveNotification", payload);
        }

        public async Task SendAppointmentStatusChangedAsync(string patientName, string status)
        {
            var payload = new
            {
                type = "StatusChanged",
                message = $"{patientName}The status of the appointment became '{status}'",
                createdAt = DateTimeOffset.UtcNow
            };

            await _hubClient.SendToGroupAsync("Admin", "ReceiveNotification", payload);
        }
    }
}
