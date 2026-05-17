using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using HospitalManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace HospitalManagement.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task SendMessage(string roomId, string message)
        {
            var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new HubException("User not found");

            if (string.IsNullOrWhiteSpace(message)) return;

            var saved = await _chatService.SaveMessageAsync(roomId, senderId, message, null, null, null);
            await Clients.Group(roomId).SendAsync("ReceiveMessage", saved);
        }

        public async Task SendFileMessage(
            string roomId, string message,
            string attachmentUrl, string attachmentName, string attachmentType)
        {
            var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new HubException("User not found");

            var saved = await _chatService.SaveMessageAsync(
                roomId, senderId, message,
                attachmentUrl, attachmentName, attachmentType);

            await Clients.Group(roomId).SendAsync("ReceiveMessage", saved);
        }
    }
}
