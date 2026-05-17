namespace HospitalManagement.Application.DTOs
{
    public class ChatMessageResponseDto
    {
        public int Id { get; set; }
        public string RoomId { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string? SenderProfileImageUrl { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
        public string? AttachmentName { get; set; }
        public string? AttachmentType { get; set; }
        public DateTimeOffset SentAt { get; set; }
    }
}
