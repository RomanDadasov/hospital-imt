using FluentValidation;
using HospitalManagement.DTOs;

namespace HospitalManagement.Validators
{
    public class CreateDoctorValidator : AbstractValidator<CreateDoctorDto>
    {
        public CreateDoctorValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.Specialization)
                .NotEmpty().WithMessage("Specialization is required.")
                .MaximumLength(200).WithMessage("Specialization must not exceed 200 characters.");

            RuleFor(x => x.Phone)
                .MaximumLength(50).WithMessage("Phone must not exceed 50 characters.")
                .Matches(@"^\+?[0-9\s\-\(\)]+$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.DepartmentId)
                .NotEmpty().WithMessage("Department is required.");
        }
    }

    public class UpdateDoctorValidator : AbstractValidator<UpdateDoctorDto>
    {
        public UpdateDoctorValidator()
        {
            RuleFor(x => x.Specialization)
                .NotEmpty().WithMessage("Specialization is required.")
                .MaximumLength(200).WithMessage("Specialization must not exceed 200 characters.");

            RuleFor(x => x.Phone)
                .MaximumLength(50).WithMessage("Phone must not exceed 50 characters.")
                .Matches(@"^\+?[0-9\s\-\(\)]+$").WithMessage("Invalid phone number format.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.DepartmentId)
                .NotEmpty().WithMessage("Department is required.");
        }
    }
}
