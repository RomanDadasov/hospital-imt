
namespace HospitalManagement.Application.DTOs
{
    public class CreateAppointmentRequestDto
    {
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string BodyRegion { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
    }

    public class AppointmentRequestResponseDto
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string BodyRegion { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
