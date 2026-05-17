namespace HospitalManagement.DTOs
{
    public class DoctorResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public string? ProfileImageUrl { get; set; }
        public decimal ConsultationFee { get; set; }
    }

    public class CreateDoctorDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public Guid DepartmentId { get; set; }
        public decimal ConsultationFee { get; set; }
    }

    public class UpdateDoctorDto
    {
        public string Specialization { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public Guid DepartmentId { get; set; }
        public decimal ConsultationFee { get; set; }
    }
}
