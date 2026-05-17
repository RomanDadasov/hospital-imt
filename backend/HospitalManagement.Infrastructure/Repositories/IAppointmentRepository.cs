using HospitalManagement.Models;

namespace HospitalManagement.Repositories
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetAllActiveAsync();
        Task<Appointment?> GetWithDetailsAsync(Guid id);
        Task<IEnumerable<Appointment>> GetByDoctorAsync(Guid doctorId);
        Task<IEnumerable<Appointment>> GetByPatientAsync(Guid patientId);
        Task<IEnumerable<Appointment>> GetByDoctorUserIdPagedAsync(string userId, string? status, int page, int pageSize);
    }
}
