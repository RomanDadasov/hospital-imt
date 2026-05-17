namespace HospitalManagement.Application.Services
{
    public interface IAuditService
    {
        Task LogAsync(string userId, string userFullName, string action, string entityType, string? entityId = null, string? details = null);
    }
}
