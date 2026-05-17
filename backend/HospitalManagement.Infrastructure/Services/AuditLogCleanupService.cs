using HospitalManagement.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.Infrastructure.Services
{
    public class AuditLogCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuditLogCleanupService> _logger;

        public AuditLogCleanupService(IServiceProvider serviceProvider, ILogger<AuditLogCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                
                var now = DateTime.Now;
                var nextRun = DateTime.Today.AddHours(3);
                if (now.Hour >= 3) nextRun = nextRun.AddDays(1);
                var delay = nextRun - now;

                await Task.Delay(delay, stoppingToken);

                try { await CleanupAsync(); }
                catch (Exception ex) { _logger.LogError(ex, "Audit log cleanup failed"); }
            }
        }

        private async Task CleanupAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var cutoff = DateTimeOffset.UtcNow.AddDays(-90);
            var deleted = await context.AuditLogs
                .Where(a => a.CreatedAt < cutoff)
                .ExecuteDeleteAsync();

            _logger.LogInformation("Audit log cleanup: {Count} note deleted", deleted);
        }
    }
}
