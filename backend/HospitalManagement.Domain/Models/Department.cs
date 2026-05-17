namespace HospitalManagement.Models
{
    public class Department
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }  
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}