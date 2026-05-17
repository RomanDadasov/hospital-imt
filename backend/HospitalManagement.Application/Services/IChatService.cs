using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IChatService
    {
        Task<ChatMessageResponseDto> SaveMessageAsync(
            string roomId,
            string senderId,
            string message,
            string? attachmentUrl,
            string? attachmentName,
            string? attachmentType);

        Task<IEnumerable<ChatMessageResponseDto>> GetRoomHistoryAsync(string roomId, int take = 50);
    }
}