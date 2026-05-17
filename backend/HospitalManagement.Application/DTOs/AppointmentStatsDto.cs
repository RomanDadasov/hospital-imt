namespace HospitalManagement.Application.DTOs
{
    public class AppointmentStatsDto
    {
        public int Total { get; set; }
        public int Confirmed { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int Pending { get; set; }
        public List<int> Monthly { get; set; } = new();
        public List<NameCountDto> ByDoctor { get; set; } = new();
        public List<NameCountDto> ByDept { get; set; } = new();
        public List<NameCountDto> ByStatus { get; set; } = new();
    }

    public class NameCountDto
    {
        public string Name { get; set; } = "";
        public int Count { get; set; }
    }
}
