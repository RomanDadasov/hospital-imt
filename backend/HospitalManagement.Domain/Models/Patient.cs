using HospitalManagement.Domain.Models;

namespace HospitalManagement.Models
{
    public class Patient
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}".Trim();
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public string? PortalToken { get; set; }
        public DateTimeOffset? PortalTokenExpiry { get; set; }
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}
