using HospitalManagement.Models;

namespace HospitalManagement.Domain.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string RoomId { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public ApplicationUser Sender { get; set; } = null!;
        public string Message { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
        public string? AttachmentName { get; set; }
        public string? AttachmentType { get; set; }
        public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
