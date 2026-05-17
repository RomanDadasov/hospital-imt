using HospitalManagement.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace HospitalManagement.Extensions
{
    public static class AuthorizationExtensions
    {
        public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly",
                    policy => policy.RequireRole("Admin"));
                options.AddPolicy("AdminOrReceptionist",
                    policy => policy.RequireRole("Admin", "Receptionist"));
                options.AddPolicy("AllRoles",
                    policy => policy.RequireRole("Admin", "Receptionist", "Doctor"));
                options.AddPolicy("DoctorOwnAppointment",
                    policy => policy.Requirements.Add(new DoctorOwnAppointmentRequirement()));
            });
            services.AddScoped<IAuthorizationHandler, DoctorOwnAppointmentHandler>();
            return services;
        }
    }
}
