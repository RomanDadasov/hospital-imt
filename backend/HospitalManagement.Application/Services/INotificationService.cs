namespace HospitalManagement.Application.Services
{
    public interface INotificationService
    {
        Task SendAppointmentCreatedAsync(string patientName, string doctorName, DateTimeOffset date);
        Task SendAppointmentStatusChangedAsync(string patientName, string status);
    }
}
