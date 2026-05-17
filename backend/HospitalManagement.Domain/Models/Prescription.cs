using HospitalManagement.Models;
using System.Text.Json.Serialization;

namespace HospitalManagement.Domain.Models
{
    public class Prescription
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public List<PrescriptionItem> Items { get; set; } = new();
        public string? Notes { get; set; }
        public DateTimeOffset PrescribedAt { get; set; } = DateTimeOffset.UtcNow;
        public string QrCode { get; set; } = string.Empty;
        public bool IsDispensed { get; set; } = false;
        public DateTimeOffset? DispensedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }

    public class PrescriptionItem
    {
        public Guid Id { get; set; }
        public Guid PrescriptionId { get; set; }

        [JsonIgnore]
        public Prescription Prescription { get; set; } = null!;
        public string MedicineName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
    }
}
