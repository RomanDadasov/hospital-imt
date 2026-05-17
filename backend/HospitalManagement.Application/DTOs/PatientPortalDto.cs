namespace HospitalManagement.Application.DTOs
{
    public class PatientPortalDto
    {
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public List<PortalAppointmentDto> Appointments { get; set; } = new();
    }

    public class PortalAppointmentDto
    {
        public Guid Id { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTimeOffset AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public bool IsPaid { get; set; }
        public string? PaymentStatus { get; set; }
    }
}
