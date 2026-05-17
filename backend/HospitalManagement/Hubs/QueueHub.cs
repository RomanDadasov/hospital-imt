using Microsoft.AspNetCore.SignalR;


namespace HospitalManagement.API.Hubs
{
    public class QueueHub : Hub
    {
        public async Task JoinQueueDisplay()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "QueueDisplay");
        }
        public async Task JoinDoctorPanel()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "DoctorPanel");
        }
        public async Task JoinReceptionPanel()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "ReceptionPanel");
        }
    }
}