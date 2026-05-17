namespace HospitalManagement.Application.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int TodayAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public List<RecentAppointmentDto> RecentAppointments { get; set; } = new();
        public List<DepartmentStatsDto> Departments { get; set; } = new();
    }

    public class RecentAppointmentDto
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTimeOffset AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class DepartmentStatsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int DoctorCount { get; set; }
    }
}
