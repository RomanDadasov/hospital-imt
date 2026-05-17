using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IQueueService
    {
        Task<QueueStateDto> GetTodayQueueAsync();
        Task<AppointmentQueueDto> AddToQueueAsync(Guid appointmentId);
        Task<AppointmentQueueDto> CallNextAsync(Guid appointmentId);
        Task<AppointmentQueueDto> CompleteCurrentAsync(Guid appointmentId);
        Task<int> GetAverageDurationAsync(Guid doctorId);
        Task ResetStaleQueueAsync();
    }
}
