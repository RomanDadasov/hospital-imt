namespace HospitalManagement.Domain.Models
{
    public class AppointmentRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string BodyRegion { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
