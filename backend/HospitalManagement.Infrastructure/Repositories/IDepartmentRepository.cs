using HospitalManagement.Models;

namespace HospitalManagement.Repositories
{
    public interface IDepartmentRepository : IRepository<Department>
    {
        Task<IEnumerable<Department>> GetAllWithDoctorsAsync();
        Task<Department?> GetWithDoctorsAsync(Guid id);
    }
}
