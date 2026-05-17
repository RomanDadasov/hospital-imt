using HospitalManagement.Domain.Models;

namespace HospitalManagement.Models
{
    public class Appointment
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;
        public Payment? Payment { get; set; }
        public string? CreatedByUserId { get; set; }
        public ApplicationUser? CreatedByUser { get; set; }
        public DateTimeOffset AppointmentDate { get; set; }
        public string? Notes { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public ICollection<AppointmentAttachment> Attachments { get; set; } = new List<AppointmentAttachment>();

      
        public string? QueueNumber { get; set; }       
        public int? QueueOrder { get; set; }         
        public DateTimeOffset? QueueEnteredAt { get; set; } 
        public DateTimeOffset? InProgressAt { get; set; }     
        public DateTimeOffset? CompletedAt { get; set; }     
    }
}