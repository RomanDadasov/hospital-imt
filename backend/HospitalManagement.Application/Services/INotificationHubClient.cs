namespace HospitalManagement.Application.Services
{
    public interface INotificationHubClient
    {
        Task SendToGroupAsync(string group, string method, object payload);
    }
}
