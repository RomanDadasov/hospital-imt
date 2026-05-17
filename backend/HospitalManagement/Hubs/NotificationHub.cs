using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.SignalR;

namespace HospitalManagement.API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task JoinGroup(string role)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, role);
        }

        public async Task LeaveGroup(string role)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, role);
        }
    }
}
