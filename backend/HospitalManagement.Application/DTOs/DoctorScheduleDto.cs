namespace HospitalManagement.Application.DTOs
{
    public class DoctorScheduleDto
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int DayOfWeek { get; set; }
        public string DayName { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int SlotDurationMinutes { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateDoctorScheduleDto
    {
        public Guid DoctorId { get; set; }
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int SlotDurationMinutes { get; set; } = 30;
    }

    public class UpdateDoctorScheduleDto
    {
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int SlotDurationMinutes { get; set; } = 30;
        public bool IsActive { get; set; }
    }

    public class AvailableSlotDto
    {
        public DateTime Date { get; set; }
        public string DayName { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
    }

    public class DoctorWeeklyScheduleDto
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public List<DayScheduleDto> WeekDays { get; set; } = new();
    }

    public class DayScheduleDto
    {
        public int DayOfWeek { get; set; }
        public string DayName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public bool IsWorkingDay { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public int SlotDurationMinutes { get; set; }
        public List<SlotDto> Slots { get; set; } = new();
    }

    public class SlotDto
    {
        public string Time { get; set; } = string.Empty;
        public DateTime DateTime { get; set; }
        public bool IsBooked { get; set; }
    }
}
