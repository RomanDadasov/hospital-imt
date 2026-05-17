
namespace HospitalManagement.Application.DTOs
{
    public class AppointmentQueueDto
    {
        public Guid Id { get; set; }
        public string QueueNumber { get; set; } = string.Empty;
        public int QueueOrder { get; set; }
        public string Status { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public DateTimeOffset AppointmentDate { get; set; }
        public DateTimeOffset? InProgressAt { get; set; }
        public int EstimatedWaitMinutes { get; set; }
    }

    public class QueueStateDto
    {
        public AppointmentQueueDto? Current { get; set; }
        public List<AppointmentQueueDto> Waiting { get; set; } = new();
        public List<AppointmentQueueDto> Completed { get; set; } = new();
        public int TotalToday { get; set; }
        public int AverageDurationMinutes { get; set; }
    }
}
