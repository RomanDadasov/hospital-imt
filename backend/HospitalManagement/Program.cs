using HospitalManagement.API.Hubs;
using HospitalManagement.Application.Services;
using HospitalManagement.Config;
using HospitalManagement.Data;
using HospitalManagement.Extensions;
using HospitalManagement.Infrastructure.Services;
using HospitalManagement.Mapping;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddAuthorizationPolicies();
builder.Services.AddCorsPolicy();
builder.Services.AddRepositoryServices();
builder.Services.AddApplicationServices();
builder.Services.AddValidationServices();
builder.Services.AddSwaggerServices();
builder.Services.Configure<EmailConfig>(
    builder.Configuration.GetSection(EmailConfig.SectionName));
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection(JwtConfig.SectionName));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddSignalR();
builder.Services.AddScoped<INotificationHubClient, NotificationHubClient>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IQueueService, QueueService>();
builder.Services.AddScoped<IQueueHubClient, QueueHubClient>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IPatientPortalService, PatientPortalService>();
builder.Services.AddHostedService<PaymentReminderService>();
builder.Services.AddHostedService<AuditLogCleanupService>();
builder.Services.AddHostedService<QueueResetBackgroundService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IDoctorScheduleService, DoctorScheduleService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
var app = builder.Build();

app.UseSwaggerServices();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<AppointmentRequestHub>("/hubs/appointment-requests");
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<QueueHub>("/hubs/queue");


using (var scope = app.Services.CreateScope())
{
    try { await RoleSeeder.SeedRolesAsync(scope.ServiceProvider); }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error seeding roles");
    }
}

app.Run();

