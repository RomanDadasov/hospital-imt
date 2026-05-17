namespace HospitalManagement.Application.Services
{
    public interface IQueueHubClient
    {
        Task SendQueueUpdatedAsync(object state);
        Task SendCallPatientAsync(object data);
    }
}