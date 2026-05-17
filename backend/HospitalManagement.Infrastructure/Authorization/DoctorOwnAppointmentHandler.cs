using HospitalManagement.Models;
using HospitalManagement.Repositories;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HospitalManagement.Authorization
{
    public class DoctorOwnAppointmentHandler : AuthorizationHandler<DoctorOwnAppointmentRequirement, Appointment>
    {
        private readonly IDoctorRepository _doctorRepository;

        public DoctorOwnAppointmentHandler(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            DoctorOwnAppointmentRequirement requirement,
            Appointment resource)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return;

            if (context.User.IsInRole("Admin") || context.User.IsInRole("Receptionist"))
            {
                context.Succeed(requirement);
                return;
            }

            if (context.User.IsInRole("Doctor"))
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                if (doctor is not null && resource.DoctorId == doctor.Id)
                {
                    context.Succeed(requirement);
                }
            }
        }
    }
}
