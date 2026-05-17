using Microsoft.AspNetCore.SignalR;
using HospitalManagement.Application.Services;

namespace HospitalManagement.API.Hubs
{
    public class QueueHubClient : IQueueHubClient
    {
        private readonly IHubContext<QueueHub> _hubContext;

        public QueueHubClient(IHubContext<QueueHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendQueueUpdatedAsync(object state)
        {
            await _hubContext.Clients.Group("QueueDisplay").SendAsync("QueueUpdated", state);
            await _hubContext.Clients.Group("ReceptionPanel").SendAsync("QueueUpdated", state);
            await _hubContext.Clients.Group("DoctorPanel").SendAsync("QueueUpdated", state);
        }

        public async Task SendCallPatientAsync(object data)
        {
            await _hubContext.Clients.Group("QueueDisplay").SendAsync("CallPatient", data);
        }
    }
}