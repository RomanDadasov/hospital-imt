using HospitalManagement.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace HospitalManagement.API.Hubs
{
    public class NotificationHubClient : INotificationHubClient
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationHubClient(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToGroupAsync(string group, string method, object payload)
        {
            await _hubContext.Clients.Group(group).SendAsync(method, payload);
        }
    }
}
