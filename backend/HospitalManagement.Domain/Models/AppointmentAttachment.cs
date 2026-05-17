namespace HospitalManagement.Models
{
    public class AppointmentAttachment
    {
        public int Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;
        public string OriginalFileName { get; set; } = string.Empty;
        public string StoredFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string StorageKey { get; set; } = string.Empty;
        public string UploadedByUserId { get; set; } = string.Empty;
        public ApplicationUser UploadedByUser { get; set; } = null!;
        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
