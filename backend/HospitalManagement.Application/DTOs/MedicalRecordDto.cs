namespace HospitalManagement.Application.DTOs
{
    public class MedicalRecordResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid? AppointmentId { get; set; }
        public string? DoctorName { get; set; }
        public string? Department { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Treatment { get; set; }
        public string? Prescription { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset RecordDate { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class CreateMedicalRecordDto
    {
        public Guid PatientId { get; set; }
        public Guid? AppointmentId { get; set; }
        public string? DoctorName { get; set; }
        public string? Department { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Treatment { get; set; }
        public string? Prescription { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset RecordDate { get; set; } = DateTimeOffset.UtcNow;
    }

    public class UpdateMedicalRecordDto
    {
        public string Diagnosis { get; set; } = string.Empty;
        public string? Treatment { get; set; }
        public string? Prescription { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset RecordDate { get; set; }
    }
}
