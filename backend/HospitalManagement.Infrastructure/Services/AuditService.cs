using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;

namespace HospitalManagement.Infrastructure.Services
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _context;

        public AuditService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string userId, string userFullName, string action, string entityType, string? entityId = null, string? details = null)
        {
            var log = new AuditLog
            {
                UserId = userId,
                UserFullName = userFullName,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                CreatedAt = DateTimeOffset.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
