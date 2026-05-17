using HospitalManagement.Models;

namespace HospitalManagement.Repositories
{
    public interface IDoctorRepository : IRepository<Doctor>
    {
        Task<IEnumerable<Doctor>> GetAllActiveAsync();
        Task<Doctor?> GetWithDetailsAsync(Guid id);
        Task<IEnumerable<Doctor>> GetByDepartmentAsync(Guid departmentId);
        Task<Doctor?> GetByUserIdAsync(string userId);
    }
}
