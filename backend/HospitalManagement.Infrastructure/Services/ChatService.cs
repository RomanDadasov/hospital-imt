using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ChatService(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        private static string? ResolveImageUrl(string? profileImagePath)
        {
            if (string.IsNullOrEmpty(profileImagePath)) return null;
            if (profileImagePath.StartsWith("http")) return profileImagePath;
            return $"/api/users/profiles/{profileImagePath}";
        }

        public async Task<ChatMessageResponseDto> SaveMessageAsync(
            string roomId, string senderId, string message,
            string? attachmentUrl, string? attachmentName, string? attachmentType)
        {
            var chatMessage = new ChatMessage
            {
                RoomId = roomId,
                SenderId = senderId,
                Message = message,
                AttachmentUrl = attachmentUrl,
                AttachmentName = attachmentName,
                AttachmentType = attachmentType,
                SentAt = DateTimeOffset.UtcNow
            };
            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            var sender = await _userManager.FindByIdAsync(senderId);
            var roles = sender != null
                ? await _userManager.GetRolesAsync(sender)
                : new List<string>();

            return new ChatMessageResponseDto
            {
                Id = chatMessage.Id,
                RoomId = chatMessage.RoomId,
                SenderId = chatMessage.SenderId,
                SenderName = sender?.FullName ?? "Unknown",
                SenderRole = roles.FirstOrDefault() ?? "",
                SenderProfileImageUrl = ResolveImageUrl(sender?.ProfileImagePath),
                Message = chatMessage.Message,
                AttachmentUrl = chatMessage.AttachmentUrl,
                AttachmentName = chatMessage.AttachmentName,
                AttachmentType = chatMessage.AttachmentType,
                SentAt = chatMessage.SentAt
            };
        }

        public async Task<IEnumerable<ChatMessageResponseDto>> GetRoomHistoryAsync(string roomId, int take = 50)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.RoomId == roomId)
                .OrderByDescending(m => m.SentAt)
                .Take(take)
                .Include(m => m.Sender)
                .ToListAsync();

            var result = new List<ChatMessageResponseDto>();
            foreach (var m in messages)
            {
                var roles = await _userManager.GetRolesAsync(m.Sender);
                result.Add(new ChatMessageResponseDto
                {
                    Id = m.Id,
                    RoomId = m.RoomId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    SenderRole = roles.FirstOrDefault() ?? "",
                    SenderProfileImageUrl = ResolveImageUrl(m.Sender.ProfileImagePath),
                    Message = m.Message,
                    AttachmentUrl = m.AttachmentUrl,
                    AttachmentName = m.AttachmentName,
                    AttachmentType = m.AttachmentType,
                    SentAt = m.SentAt
                });
            }
            return result.OrderBy(m => m.SentAt);
        }
    }
}