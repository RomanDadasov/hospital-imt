using FluentValidation;
using HospitalManagement.DTOs;

namespace HospitalManagement.Validators
{
    public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentDto>
    {
        public CreateAppointmentValidator()
        {
            RuleFor(x => x.DoctorId)
                .NotEmpty().WithMessage("Doctor is required.");

            RuleFor(x => x.PatientId)
                .NotEmpty().WithMessage("Patient is required.");

            RuleFor(x => x.AppointmentDate)
                .NotEmpty().WithMessage("Appointment date is required.")
                .GreaterThan(DateTimeOffset.UtcNow)
                .WithMessage("Appointment date must be in the future.");

            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
        }
    }

    public class UpdateAppointmentValidator : AbstractValidator<UpdateAppointmentDto>
    {
        public UpdateAppointmentValidator()
        {
            RuleFor(x => x.AppointmentDate)
                .NotEmpty().WithMessage("Appointment date is required.")
                .GreaterThan(DateTimeOffset.UtcNow)
                .WithMessage("Appointment date must be in the future.");

            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.");
        }
    }
}
