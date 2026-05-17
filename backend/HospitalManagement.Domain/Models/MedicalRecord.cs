using HospitalManagement.Models;

namespace HospitalManagement.Domain.Models
{
    public class MedicalRecord
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;
        public Guid? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }
        public string? DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string? Department { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Treatment { get; set; }
        public string? Prescription { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset RecordDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public string CreatedByUserId { get; set; } = string.Empty;
    }
}
