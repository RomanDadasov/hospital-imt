using AutoMapper;
using HospitalManagement.DTOs;
using HospitalManagement.Models;


namespace HospitalManagement.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Department
            CreateMap<Department, DepartmentResponseDto>()
                .ForMember(dest => dest.DoctorCount, opt => opt.MapFrom(src => src.Doctors.Count));
            CreateMap<CreateDepartmentDto, Department>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Doctors, opt => opt.Ignore());
            CreateMap<UpdateDepartmentDto, Department>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Doctors, opt => opt.Ignore());

            // Doctor
            CreateMap<Doctor, DoctorResponseDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.MapFrom(src => src.User.ProfileImagePath));

            // Patient
            CreateMap<Patient, PatientResponseDto>()
                .ForMember(dest => dest.AppointmentCount, opt => opt.MapFrom(src => src.Appointments.Count));
            CreateMap<CreatePatientDto, Patient>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Appointments, opt => opt.Ignore());
            CreateMap<UpdatePatientDto, Patient>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Appointments, opt => opt.Ignore());

            // Appointment

            CreateMap<Appointment, AppointmentResponseDto>()
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor.User.FullName))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Doctor.Department.Name))
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Patient.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.Status.ToString() : null))
                .ForMember(dest => dest.QueueNumber, opt => opt.MapFrom(src => src.QueueNumber))
                .ForMember(dest => dest.PaymentTransactionId, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.TransactionId : null))
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src =>
                    src.Attachments.Select(a => new AppointmentAttachmentDto
                    {
                        Id = a.Id,
                        OriginalFileName = a.OriginalFileName,
                        ContentType = a.ContentType,
                        FileSize = a.FileSize,
                        StorageKey = a.StorageKey,
                        UploadedAt = a.UploadedAt
                    }).ToList()));

            CreateMap<CreateAppointmentDto, Appointment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => AppointmentStatus.Pending))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Doctor, opt => opt.Ignore())
                .ForMember(dest => dest.Patient, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()); 


            // User
            CreateMap<ApplicationUser, UserResponseDto>()
                .ForMember(dest => dest.Roles, opt => opt.Ignore())
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.MapFrom(src => src.ProfileImagePath));
        }
    }
}
