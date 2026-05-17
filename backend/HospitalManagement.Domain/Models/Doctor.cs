using HospitalManagement.Domain.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagement.Models
{
    public class Doctor
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public Guid DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
        public string Specialization { get; set; } = string.Empty;
        public string? Phone { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal ConsultationFee { get; set; } = 0;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
    }
}
