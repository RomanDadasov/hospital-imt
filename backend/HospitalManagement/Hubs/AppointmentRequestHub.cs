using Microsoft.AspNetCore.SignalR;


namespace HospitalManagement.API.Hubs
{
    public class AppointmentRequestHub : Hub
    {
        public async Task JoinReceptionistGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Receptionists");
        }
    }
}
