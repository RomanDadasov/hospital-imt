namespace HospitalManagement.Application.DTOs
{
    public class PrescriptionResponseDto
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public List<PrescriptionItemDto> Items { get; set; } = new();
        public string? Notes { get; set; }
        public DateTimeOffset PrescribedAt { get; set; }
        public string QrCode { get; set; } = string.Empty;
        public bool IsDispensed { get; set; }
        public DateTimeOffset? DispensedAt { get; set; }
    }

    public class PrescriptionItemDto
    {
        public string MedicineName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
    }

    public class CreatePrescriptionDto
    {
        public Guid AppointmentId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public List<PrescriptionItemDto> Items { get; set; } = new();
        public string? Notes { get; set; }
    }
}
