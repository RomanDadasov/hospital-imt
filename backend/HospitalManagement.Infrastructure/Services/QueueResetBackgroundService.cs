using HospitalManagement.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.Infrastructure.Services
{
    public class QueueResetBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<QueueResetBackgroundService> _logger;

        public QueueResetBackgroundService(IServiceProvider serviceProvider, ILogger<QueueResetBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await RunReset();

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextMidnight = DateTime.Today.AddDays(1);
                var delay = nextMidnight - now;

                await Task.Delay(delay, stoppingToken);

                await RunReset();
            }
        }

        private async Task RunReset()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var queueService = scope.ServiceProvider.GetRequiredService<IQueueService>();
                await queueService.ResetStaleQueueAsync();
                _logger.LogInformation("Queue stale reset completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Queue reset failed.");
            }
        }
    }
}
