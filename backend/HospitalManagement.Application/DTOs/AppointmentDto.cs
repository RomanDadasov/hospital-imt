using HospitalManagement.Models;

namespace HospitalManagement.DTOs
{
    public class AppointmentResponseDto
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTimeOffset AppointmentDate { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PaymentStatus { get; set; }
        public string? PaymentTransactionId { get; set; }
        public decimal DoctorConsultationFee { get; set; }
        public string? QueueNumber { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public List<AppointmentAttachmentDto> Attachments { get; set; } = new();
    }

    public class CreateAppointmentDto
    {
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public DateTimeOffset AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateAppointmentDto
    {
        public DateTimeOffset AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class ChangeAppointmentStatusDto
    {
        public AppointmentStatus Status { get; set; }
    }

    public class AppointmentAttachmentDto
    {
        public int Id { get; set; }
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string StorageKey { get; set; } = string.Empty;
        public DateTimeOffset UploadedAt { get; set; }
    }
}
