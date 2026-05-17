namespace HospitalManagement.DTOs
{
    public class AttachmentResponseDto
    {
        public int Id { get; set; }
        public Guid AppointmentId { get; set; }
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string UploadedByUserId { get; set; } = string.Empty;
        public DateTimeOffset UploadedAt { get; set; }
    }
}
